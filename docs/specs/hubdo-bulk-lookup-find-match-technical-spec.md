# HubDo Bulk Lookup Find-Match - Technical Specification

**Version:** 1.0  
**Status:** Draft  
**Date:** 2026-05-07

## 1. Architecture

### 1.1 New Queue

```
RabbitMQ Queue: hubdo_bulk_lookup_find_match_queue
├─ Prefetch: 10 (same as standard bulk)
├─ Message format: HubdoBulkLookupFindMatchQueueMessage
└─ Consumer: startHubdoBulkFindMatchConsumer()
```

### 1.2 Type Definitions

```typescript
// src/hubdoCpf/domain/bulk-lookup-find-match-types.ts

export type HubdoBulkLookupFindMatchJobStatus =
  | "queued"
  | "processing"
  | "found"
  | "completed"
  | "failed";

export interface HubdoBulkLookupFindMatchQueueMessage {
  jobId: string;
  itemId: string;
  cpf: string;
  mode: HubdoBulkLookupMode;
  attempt: number;
}

export interface HubdoBulkLookupFindMatchJob {
  id: string;
  mode: HubdoBulkLookupMode;
  targetName: string;
  targetNameNormalized: string;
  status: HubdoBulkLookupFindMatchJobStatus;
  totalItems: number;
  queuedItems: number;
  processingItems: number;
  successItems: number;
  errorItems: number;
  skippedItems: number;
  foundCpf: string | null;
  foundName: string | null;
  foundBirthDate: string | null;
  requestedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
}

export interface HubdoBulkLookupFindMatchCreateJobInput {
  cpfs: string[];
  mode: HubdoBulkLookupMode;
  targetName: string;
  targetNameNormalized: string;
  requestedBy?: string;
}
```

### 1.3 Database Schema

```typescript
// src/database/schema.ts - Add to hubdoBulkLookupJobs table

export const hubdoBulkLookupJobs = pgTable("hubdo_bulk_lookup_jobs", {
  // ... existing fields ...
  status: text("status").notNull(), // 'queued' | 'processing' | 'completed' | 'failed' | 'found'
  foundCpf: text("found_cpf"), // NEW
  foundName: text("found_name"), // NEW
  foundBirthDate: text("found_birth_date"), // NEW
  findMatchMode: boolean("find_match_mode").notNull().default(false), // NEW: flag to distinguish find-match jobs
  // ...
});
```

## 2. Service Layer

### 2.1 New Service Method

```typescript
// src/hubdoCpf/application/hubdo-bulk-lookup.service.ts

async enqueueBulkJobFindMatch(input: {
    cpfs: string[];
    mode: HubdoBulkLookupMode;
    targetName: string;
    requestedBy?: string;
}): Promise<HubdoBulkLookupCreateJobResult> {
    const targetName = input.targetName.trim();
    if (!targetName) {
        throw new Error('Target name is required for find-match mode.');
    }

    const targetNameNormalized = normalizePersonName(targetName);
    const normalizedCpfs = Array.from(
        new Set(
            input.cpfs
                .map((cpf) => normalizeCpf(cpf))
                .filter((cpf) => cpf.length > 0),
        ),
    );

    // NO exclusion filtering here (we search everything)
    const created = await this.repository.createFindMatchJob({
        cpfs: normalizedCpfs,
        mode: input.mode,
        targetName,
        targetNameNormalized,
        requestedBy: input.requestedBy,
    });

    // Publish to FIND_MATCH queue (not standard bulk queue)
    await Promise.all(
        created.items.map((item) =>
            publishHubdoBulkLookupFindMatchItem({
                jobId: created.job.id,
                itemId: item.id,
                cpf: item.cpf,
                mode: created.job.mode,
                attempt: 1,
            }),
        ),
    );

    return created;
}
```

### 2.2 Repository Interface Extension

```typescript
// src/hubdoCpf/domain/bulk-lookup-types.ts

export interface HubdoBulkLookupRepository {
  // ... existing methods ...

  // NEW: Find-match specific methods
  createFindMatchJob(
    input: HubdoBulkLookupFindMatchCreateJobInput,
  ): Promise<HubdoBulkLookupCreateJobResult>;
  markFindMatchJobAsFound(
    jobId: string,
    cpf: string,
    name: string,
    birthDate: string | null,
  ): Promise<void>;
  markFindMatchItemsAsSkipped(jobId: string): Promise<void>;
  getFindMatchJobById(
    jobId: string,
  ): Promise<HubdoBulkLookupFindMatchJob | null>;
}
```

## 3. API Endpoint

```typescript
// app/api/hubdo-cpf-lookup/bulk-find-match/route.ts

export async function POST(request: Request): Promise<NextResponse> {
  // Validate: cpfs, mode, targetName
  // Call service.enqueueBulkJobFindMatch()
  // Return 202 with jobId + summary
}
```

## 4. Consumer Implementation

```typescript
// src/queue/rabbitmq/hubdo-bulk-find-match-consumer.ts

export async function startHubdoBulkFindMatchConsumer(deps: {
  hubdoLookupService: HubdoCpfLookupService;
  bulkRepository: HubdoBulkLookupRepository;
  generatorHistoryService: GeneratorCpfHistoryService;
}): Promise<void> {
  const channel = await createRabbitMqChannel();
  await channel.prefetch(getRabbitMqPrefetch());

  const jobFoundStatusCache = new Map<string, boolean>();

  await channel.consume(
    HUBDO_BULK_LOOKUP_FIND_MATCH_QUEUE,
    async (rawMessage) => {
      if (!rawMessage) return;

      let parsed: HubdoBulkLookupFindMatchQueueMessage | null = null;

      try {
        parsed = JSON.parse(rawMessage.content.toString("utf-8"));
      } catch {
        channel.ack(rawMessage);
        return;
      }

      try {
        // Check if job already found (from cache or DB)
        const isAlreadyFound = jobFoundStatusCache.get(parsed.jobId) ?? false;

        if (isAlreadyFound) {
          // Mark this item as skipped, don't call HubDo API
          await deps.bulkRepository.markItemSkipped(parsed.itemId);
          channel.ack(rawMessage);
          return;
        }

        // Mark as processing
        await deps.bulkRepository.markItemProcessing(
          parsed.itemId,
          parsed.attempt,
        );

        // Emit item processing event
        emitHubdoBulkItemUpdated({
          jobId: parsed.jobId,
          itemId: parsed.itemId,
          cpf: parsed.cpf,
          status: "processing",
          attemptCount: parsed.attempt,
          updatedAt: new Date().toISOString(),
          errorCode: null,
          errorMessage: null,
          creditosConsumidos: 0,
          origin: null,
        });

        // Call HubDo API
        const lookupResult = await deps.hubdoLookupService.lookup({
          cpf: parsed.cpf,
          mode: parsed.mode,
        });

        if (lookupResult.status === "success") {
          await deps.bulkRepository.markItemSuccess({
            itemId: parsed.itemId,
            attemptCount: parsed.attempt,
            creditosConsumidos: lookupResult.creditosConsumidos,
            origin: lookupResult.origem,
            hubdoLookupId: latestLookupId,
          });

          const lookupName = lookupResult.nome?.trim();
          if (lookupName) {
            const jobTarget = await deps.bulkRepository.getJobById(
              parsed.jobId,
            );
            if (jobTarget) {
              const foundNameNormalized = normalizePersonName(lookupName);
              const isMatch =
                foundNameNormalized === jobTarget.targetNameNormalized;

              if (isMatch) {
                // ✅ FOUND! Mark job and emit event
                await deps.bulkRepository.markFindMatchJobAsFound(
                  parsed.jobId,
                  parsed.cpf,
                  lookupName,
                  lookupResult.dataNascimento ?? null,
                );

                // Mark all remaining items as skipped
                await deps.bulkRepository.markFindMatchItemsAsSkipped(
                  parsed.jobId,
                );

                // Cache it
                jobFoundStatusCache.set(parsed.jobId, true);

                // Emit realtime event
                emitHubdoBulkFindMatchFound({
                  jobId: parsed.jobId,
                  foundCpf: parsed.cpf,
                  foundName: lookupName,
                  foundBirthDate: lookupResult.dataNascimento ?? null,
                });

                channel.ack(rawMessage);
                return;
              }
            }
          }

          // No match, emit success and continue
          emitHubdoBulkItemUpdated({
            jobId: parsed.jobId,
            itemId: parsed.itemId,
            cpf: parsed.cpf,
            status: "success",
            attemptCount: parsed.attempt,
            updatedAt: new Date().toISOString(),
            errorCode: null,
            errorMessage: null,
            creditosConsumidos: lookupResult.creditosConsumidos,
            origin: lookupResult.origem,
          });

          channel.ack(rawMessage);
          return;
        }

        // Error handling (same retry logic as standard bulk)
        const retryable = isRetryableErrorCode(lookupResult.errorCode);
        const maxRetries = getBulkMaxRetries();

        if (retryable && parsed.attempt < maxRetries) {
          const nextAttempt = parsed.attempt + 1;
          await deps.bulkRepository.markItemQueued(
            parsed.itemId,
            nextAttempt,
            lookupResult.errorCode,
            lookupResult.message,
          );

          await delay(getBulkRetryDelayMs());
          await publishHubdoBulkLookupFindMatchItem({
            ...parsed,
            attempt: nextAttempt,
          });

          channel.ack(rawMessage);
          return;
        }

        // Max retries exceeded
        await deps.bulkRepository.markItemDeadLetter({
          itemId: parsed.itemId,
          attemptCount: parsed.attempt,
          errorCode: lookupResult.errorCode,
          errorMessage: lookupResult.message,
        });

        channel.ack(rawMessage);
      } catch (error) {
        console.error("[HubDo Find-Match Consumer] Error:", error);
        channel.nack(rawMessage, false, true); // requeue
      }
    },
  );
}
```

## 5. Realtime Events

### 5.1 New Socket.io Event

```typescript
// src/realtime/hubdo-bulk-events.ts

export function emitHubdoBulkFindMatchFound(event: {
  jobId: string;
  foundCpf: string;
  foundName: string;
  foundBirthDate: string | null;
}): void {
  const io = getIO();
  io.to(`hubdo:job:${event.jobId}`).emit("hubdo:bulk:found", {
    jobId: event.jobId,
    foundCpf: event.foundCpf,
    foundName: event.foundName,
    foundBirthDate: event.foundBirthDate,
    timestamp: new Date().toISOString(),
  });
}
```

## 6. RabbitMQ Publisher

```typescript
// src/queue/rabbitmq/publisher.ts

export async function publishHubdoBulkLookupFindMatchItem(
  message: HubdoBulkLookupFindMatchQueueMessage,
): Promise<void> {
  const channel = await getRabbitMqChannel();
  channel.sendToQueue(
    HUBDO_BULK_LOOKUP_FIND_MATCH_QUEUE,
    Buffer.from(JSON.stringify(message)),
    { persistent: true },
  );
}
```

## 7. Frontend Integration

### 7.1 Modal Enhancement

Add radio button to confirm bulk lookup modal:

```typescript
const [findMatchMode, setFindMatchMode] = useState(false);
```

### 7.2 Handler Function

```typescript
async function handleBulkLookupFindMatch(targetName: string): Promise<void> {
  const response = await fetch("/api/hubdo-cpf-lookup/bulk-find-match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cpfs: selectedCpfs,
      mode: bulkLookupMode,
      targetName,
    }),
  });
  // ... rest of logic
}
```

### 7.3 Socket.io Hook

```typescript
socket.on("hubdo:bulk:found", (event) => {
  // Display "✅ Found!" message with CPF/name/birthDate
  setFindMatchResult(event);
});
```

## 8. Migration

Generate with:

```bash
npm run db:generate
```

This will create a migration file updating `hubdo_bulk_lookup_jobs` schema.

## 9. Constants

```typescript
// src/queue/rabbitmq/constants.ts

export const HUBDO_BULK_LOOKUP_FIND_MATCH_QUEUE =
  "hubdo_bulk_lookup_find_match_queue";
```

## 10. Error Scenarios

| Scenario                             | Behavior                               |
| ------------------------------------ | -------------------------------------- |
| targetName empty                     | Return 400                             |
| CPFs > 100                           | Return 400                             |
| No valid CPFs after normalization    | Return 400                             |
| All CPFs processed, no match found   | Job status = `completed` (not `found`) |
| Consumer crashes after finding match | realtime event resent on reconnect     |
| Job:found fires, but DB write fails  | Log error, continue queue processing   |

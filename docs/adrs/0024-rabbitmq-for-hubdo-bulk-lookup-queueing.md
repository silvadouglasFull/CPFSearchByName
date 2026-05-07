# ADR 0024 - RabbitMQ Queueing for HubDo Bulk CPF Lookup

## Status

Proposed

## Context

The current bulk CPF lookup flow executes HubDo queries during the same HTTP request. This synchronous approach is functional for small batches but creates operational risks as volume grows:

- request timeout risk for large payloads,
- burst pressure on HubDo API and credit consumption,
- poor retry control per item,
- weak observability for long-running executions,
- user experience limited to waiting for immediate completion.

Given the new mass-lookup use case, the system needs asynchronous processing with controlled throughput and robust retry/dead-letter behavior.

## Decision

1. Introduce RabbitMQ for bulk lookup orchestration

- Use RabbitMQ as broker for HubDo mass lookup jobs.
- API layer enqueues jobs instead of processing all CPFs synchronously.
- Dedicated workers consume queue messages and call `HubdoCpfLookupService.lookup` per item.

2. Split the flow into job lifecycle

- `POST` creates a bulk job and enqueues CPF tasks.
- Worker processes CPF tasks asynchronously.
- API exposes status/progress endpoint(s) for polling.

3. Add persistence for job and item statuses

- Persist job metadata (queued/running/completed/failed/cancelled).
- Persist item-level execution result (success/error, retries, timestamps).
- Keep job records as source of truth for UI progress and history.

4. Keep service reuse and idempotency

- Worker must reuse existing `HubdoCpfLookupService.lookup`.
- Messages include idempotency keys to avoid duplicate processing side effects.
- Item retries must not duplicate final persisted state in an uncontrolled way.

5. Add retry and dead-letter strategy

- Configure retry with bounded attempts and backoff.
- Route permanently failed items/messages to a Dead Letter Queue (DLQ).
- Expose operational visibility for failed jobs/items.

## Consequences

### Positive

- Better scalability for large batches.
- Improved resilience with controlled retries and DLQ.
- Better user experience via async job status updates.
- Better operational monitoring and diagnostics.

### Negative

- Increased infrastructure complexity (broker + workers).
- Additional persistence schema and status-management code.
- Eventual consistency instead of immediate response.

### Mitigation

- Start with a single queue and one worker pool profile.
- Add strict schema and state transitions for job lifecycle.
- Provide clear UI and API status contracts for async behavior.

## Related ADRs

- ADR 0019 - HubDo CPF WebService Integration
- ADR 0020 - HubDo CPF Lookup UI Page with Search and History
- ADR 0023 - Generator CPF Multi-Selection and Bulk HubDo Lookup

## Traceability

1. API enqueue/status

- `app/api/hubdo-cpf-lookup/bulk/route.ts`
- `app/api/hubdo-cpf-lookup/bulk/[jobId]/route.ts`

2. Worker orchestration

- `src/hubdoCpf/application/hubdo-bulk-lookup-worker.service.ts`

3. Queue adapter

- `src/queue/rabbitmq/*.ts`

4. Job persistence

- `src/database/schema.ts`
- `src/hubdoCpf/infrastructure/drizzle-hubdo-bulk-lookup.repository.ts`

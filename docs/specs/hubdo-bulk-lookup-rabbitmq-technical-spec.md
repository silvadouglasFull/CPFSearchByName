# Technical Specification - RabbitMQ Architecture for HubDo Bulk CPF Lookup

## Overview

Implement asynchronous mass CPF lookup processing using RabbitMQ. The HTTP API enqueues CPF tasks and returns a `jobId`; background workers process queue messages and persist progress.

## High-level architecture

1. API layer

- Receives bulk request.
- Creates job record and item records with initial status `queued`.
- Publishes one message per CPF item to RabbitMQ.
- Returns `202 Accepted` with `jobId`.

2. Queue broker

- RabbitMQ with dedicated exchange/queue for HubDo bulk lookup.
- Dead letter exchange/queue for exhausted retries.

3. Worker layer

- Consumes CPF item messages.
- Calls `HubdoCpfLookupService.lookup`.
- Updates item/job status in PostgreSQL.

4. Status API

- Returns aggregate counters and item-level details for job progress.

## RabbitMQ topology

### Exchange

- `hubdo.bulk.lookup.exchange` (type: direct)

### Main queue

- `hubdo.bulk.lookup.queue`
- Durable: `true`
- Routing key: `hubdo.bulk.lookup.item`

### DLX / DLQ

- Exchange: `hubdo.bulk.lookup.dlx`
- Queue: `hubdo.bulk.lookup.dlq`
- Routing key: `hubdo.bulk.lookup.item.dead`

### Message properties

- `messageId`: item id (UUID)
- `correlationId`: job id (UUID)
- headers:
  - `x-job-id`
  - `x-item-id`
  - `x-attempt`

## Environment variables

- `RABBITMQ_URL=amqp://guest:guest@localhost:5672`
- `RABBITMQ_PREFETCH=10`
- `HUBDO_BULK_MAX_RETRIES=3`
- `HUBDO_BULK_RETRY_DELAY_MS=1000`
- `HUBDO_BULK_CONCURRENCY=4`

## Database schema

### Table: `hubdo_bulk_lookup_jobs`

- `id uuid pk`
- `mode text not null` (`normal` | `turbo`)
- `status text not null` (`queued` | `processing` | `completed` | `failed`)
- `total_items integer not null`
- `queued_items integer not null default 0`
- `processing_items integer not null default 0`
- `success_items integer not null default 0`
- `error_items integer not null default 0`
- `requested_by text null` (future user context)
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `finished_at timestamptz null`

### Table: `hubdo_bulk_lookup_job_items`

- `id uuid pk`
- `job_id uuid fk -> hubdo_bulk_lookup_jobs.id`
- `cpf text not null`
- `status text not null` (`queued` | `processing` | `success` | `error` | `dead_letter`)
- `attempt_count integer not null default 0`
- `error_code text null`
- `error_message text null`
- `creditos_consumidos integer not null default 0`
- `origin text null`
- `hubdo_lookup_id uuid null` (optional fk to `hubdo_cpf_lookups.id`)
- `created_at timestamptz not null`
- `updated_at timestamptz not null`
- `finished_at timestamptz null`

Indexes:

- `hubdo_bulk_lookup_job_items_job_id_idx`
- `hubdo_bulk_lookup_job_items_status_idx`
- unique optional: `(job_id, cpf)` to enforce dedupe per job

## API contracts

### POST `/api/hubdo-cpf-lookup/bulk`

Request:

```json
{
  "cpfs": ["12345678901", "98765432100"],
  "mode": "normal"
}
```

Response (`202`):

```json
{
  "jobId": "uuid",
  "status": "queued",
  "summary": {
    "total": 2,
    "queued": 2,
    "processing": 0,
    "success": 0,
    "error": 0
  }
}
```

### GET `/api/hubdo-cpf-lookup/bulk/[jobId]`

Response (`200`):

```json
{
  "job": {
    "id": "uuid",
    "mode": "normal",
    "status": "processing",
    "createdAt": "...",
    "updatedAt": "...",
    "finishedAt": null
  },
  "summary": {
    "total": 100,
    "queued": 20,
    "processing": 4,
    "success": 70,
    "error": 6
  },
  "items": [
    {
      "id": "uuid",
      "cpf": "12345678901",
      "status": "success",
      "attemptCount": 1,
      "creditosConsumidos": 5,
      "origin": "receita_federal"
    }
  ]
}
```

Optional query params for items pagination/filter:

- `page`, `pageSize`, `status`

## Worker behavior

1. Consume message.
2. Mark item as `processing`.
3. Execute `service.lookup({ cpf, mode })`.
4. If success:
   - mark item `success`.
   - persist consumed credits/origin.
5. If handled business error:
   - mark item `error` with code/message.
6. If transient failure:
   - retry until max attempts.
7. If exhausted:
   - nack/reject to DLQ and mark item `dead_letter`.
8. Recompute job aggregate counters and terminal status when applicable.

## State transition rules

### Job

- `queued` -> `processing` when first item starts
- `processing` -> `completed` when all items terminal (`success`/`error`/`dead_letter`)
- `processing` -> `failed` only on unrecoverable job-level error

### Item

- `queued` -> `processing`
- `processing` -> `success` | `error`
- `processing` -> `queued` (retry path)
- `processing` -> `dead_letter` (retry exhausted)

## Idempotency strategy

- Use `(job_id, cpf)` unique constraint for enqueue dedupe.
- Worker updates by `item_id` and ignores duplicate terminal processing.
- Message acknowledgements only after DB status update is persisted.

## Integration points

1. Existing service reuse

- `src/hubdoCpf/application/hubdo-cpf-lookup.service.ts`

2. New queue adapter

- `src/queue/rabbitmq/connection.ts`
- `src/queue/rabbitmq/publisher.ts`
- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`

3. New repository/service for job lifecycle

- `src/hubdoCpf/domain/bulk-lookup-types.ts`
- `src/hubdoCpf/application/hubdo-bulk-lookup.service.ts`
- `src/hubdoCpf/infrastructure/drizzle-hubdo-bulk-lookup.repository.ts`

## Docker and local development

Add RabbitMQ service in `docker-compose.yml`:

- image: `rabbitmq:3.13-management-alpine`
- ports:
  - `5672:5672` (AMQP)
  - `15672:15672` (management UI)
- persistent volume for broker data

## Validation strategy

### Automated

- `npm run lint`
- `npm run build`
- integration tests for:
  - enqueue behavior,
  - worker success path,
  - retry and DLQ path,
  - status endpoint consistency.

### Manual

1. Submit bulk request and verify `202` + `jobId`.
2. Observe progress moving from `queued` to `processing` to terminal.
3. Simulate transient errors and confirm retry behavior.
4. Simulate permanent errors and confirm DLQ routing.
5. Confirm UI polling shows aggregate and item-level progression.

## Rollout plan

1. Introduce schema and repository for jobs/items.
2. Add RabbitMQ connection + publisher + consumer.
3. Convert bulk API to enqueue-only (`202`).
4. Add status endpoint and UI polling.
5. Enable observability and DLQ monitoring dashboards.

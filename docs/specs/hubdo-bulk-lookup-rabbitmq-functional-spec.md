# Functional Specification - RabbitMQ Queueing for HubDo Bulk Lookup

## Objective

Enable reliable asynchronous processing for mass CPF lookup via HubDo by enqueuing requests in RabbitMQ and exposing job-based progress to users.

## Scope

- Replace synchronous bulk execution with queue-based async processing.
- Create and track bulk lookup jobs.
- Process CPF items in background workers.
- Expose API for job creation and job status polling.
- Show queue/job progress and final summary in UI.

## User journey

### Journey 1: Submit bulk lookup

1. User selects multiple CPFs in Generator CPF results.
2. User chooses lookup mode (`normal` or `turbo`).
3. User clicks `Lookup selected CPFs`.
4. System creates a bulk job and enqueues CPF tasks.
5. User immediately receives `jobId` and initial status `queued`.

### Journey 2: Track progress

1. UI polls job status endpoint with `jobId`.
2. User sees progress counters:
   - total,
   - queued,
   - processing,
   - success,
   - error.
3. UI updates until terminal status (`completed` or `failed`).

### Journey 3: Review final outcome

1. User opens job details.
2. System shows item-level outcomes per CPF.
3. User can filter failed CPFs and optionally retry failed subset (future phase).

## Inputs

### Job creation request

- `cpfs: string[]` (required, deduplicated server-side)
- `mode: 'normal' | 'turbo'` (required)

### Job status query

- `jobId` path param

## Outputs

### Create job response

- `jobId`
- `status` (`queued`)
- `summary` with total items

### Status response

- job metadata
- aggregate counters (`total`, `queued`, `processing`, `success`, `error`)
- optional paginated item list with item-level status

## Business rules

- Job creation requires at least 1 CPF and enforces max batch size.
- CPFs are normalized and deduplicated before enqueue.
- Each CPF item is processed independently.
- Partial failures do not fail successful items.
- Terminal status rules:
  - `completed`: all items processed (with success and/or error)
  - `failed`: unrecoverable job-level error before item completion
- Retry attempts per item are bounded.

## Non-functional requirements

- Queueing must support backpressure control.
- Worker concurrency must be configurable.
- System must keep audit trail of job/item processing.
- Failure handling must support dead-letter diagnostics.

## Acceptance criteria

- API returns `jobId` instead of waiting for full batch completion.
- Worker consumes queue and executes HubDo lookups asynchronously.
- Job status endpoint reports live progress.
- Item-level success/error results are persisted and retrievable.
- Failed messages are routed to DLQ after retry exhaustion.

## Requirement traceability

1. Bulk enqueue API

- `app/api/hubdo-cpf-lookup/bulk/route.ts`

2. Job status API

- `app/api/hubdo-cpf-lookup/bulk/[jobId]/route.ts`

3. Queue consumer

- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`

4. Job persistence and domain

- `src/hubdoCpf/domain/bulk-lookup-types.ts`
- `src/hubdoCpf/infrastructure/drizzle-hubdo-bulk-lookup.repository.ts`

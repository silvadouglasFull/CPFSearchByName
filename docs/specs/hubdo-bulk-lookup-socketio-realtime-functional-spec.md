# Functional Specification - HubDo Bulk Lookup Real-time Status with Socket.io + amqplib

## Objective

Provide real-time status updates for HubDo bulk CPF lookup jobs using Socket.io events emitted from RabbitMQ consumers implemented with amqplib.

## Scope

- Keep RabbitMQ as the async backbone for bulk HubDo lookup processing.
- Add Socket.io server integration to broadcast item and job status changes in real time.
- Allow frontend screens to subscribe to a specific job and update UI instantly.
- Preserve existing enqueue endpoint and persistence model for jobs/items.

## Out of scope

- Replacing RabbitMQ with another broker.
- Migrating to managed event streaming platforms.
- Building a full WebSocket auth provider (initial phase uses existing session context).

## User journeys

### Journey 1: Start bulk lookup and receive live updates

1. User selects CPF records and starts bulk lookup.
2. API returns `jobId` with initial status `queued`.
3. Frontend opens Socket.io connection and subscribes to the job room.
4. As worker processes each CPF, UI receives events and updates counters/item badges instantly.
5. When the job reaches terminal status, UI shows final summary without waiting for polling intervals.

### Journey 2: Observe item-level lifecycle

1. Item starts as `queued`.
2. Consumer marks item as `processing` and emits update.
3. Item finishes as `success` or `error` and emits update.
4. UI reflects the exact item status and retry attempts in near real time.

### Journey 3: Temporary socket disconnect

1. User loses connection or reloads browser.
2. Frontend reconnects and re-subscribes to `jobId` room.
3. Frontend fetches latest snapshot from status endpoint to heal possible event gaps.
4. UI resumes live updates from the socket stream.

## Inputs

### Job subscription input

- `jobId: string` (required)

### Server-side event source

- RabbitMQ message lifecycle events from worker processing.

## Outputs

### Frontend outputs

- Live counters (`queued`, `processing`, `success`, `error`, `deadLetter`).
- Live item list updates for affected CPF rows.
- Final completion message when job terminal event is received.

### Realtime event outputs

- `hubdo.bulk.job.subscribed`
- `hubdo.bulk.item.updated`
- `hubdo.bulk.job.updated`
- `hubdo.bulk.job.completed`
- `hubdo.bulk.job.failed`

## Business rules

- Real-time events must be scoped by `jobId` room to avoid cross-job leakage.
- Only server-side workers emit processing events.
- Terminal job event is emitted exactly once per terminal transition.
- Frontend must keep GET status endpoint as reconciliation fallback.

## Non-functional requirements

- End-to-end event latency target: under 500 ms after worker state persistence.
- Socket reconnection should recover without user action.
- Broadcast traffic must not include sensitive credentials or broker internals.
- Worker throughput and queue resilience must remain unchanged.

## Acceptance criteria

- UI receives item status transitions in real time for a subscribed job.
- UI counters update without polling delay while socket is connected.
- Terminal event closes loading state and shows final summary.
- On reconnect, UI recovers by snapshot + resumed events.
- Existing asynchronous queue flow remains the source of truth.

## Requirement traceability

1. Socket API route and room subscription

- `app/api/socket/route.ts` (or custom server entrypoint)

2. RabbitMQ consumer event emission

- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`
- `src/hubdoCpf/application/hubdo-bulk-lookup-worker.service.ts`

3. Frontend realtime client orchestration

- `src/components/generator-cpf/generator-cpf-client.tsx`

4. Snapshot fallback endpoint

- `app/api/hubdo-cpf-lookup/bulk/[jobId]/route.ts`

# Technical Specification - Socket.io + amqplib Realtime Pipeline for HubDo Bulk Lookup

## Overview

This specification defines a custom realtime architecture where RabbitMQ workers (amqplib) publish status changes to Socket.io so the frontend can render live job and item progression.

## Architecture

1. Enqueue API

- `POST /api/hubdo-cpf-lookup/bulk` creates job/items and publishes one message per item.
- Returns `202` with `jobId` immediately.

2. Worker/consumer (amqplib)

- Consumes queue items from RabbitMQ.
- Persists item/job status transitions.
- Emits realtime events through Socket.io after successful persistence.

3. Socket layer

- Socket.io server runs in Next.js runtime bridge (API route or custom server).
- Clients join room `hubdo:job:{jobId}`.
- Server emits room-scoped status events.

4. Frontend

- Uses `socket.io-client` to connect, authenticate session context, and subscribe by `jobId`.
- Applies event-driven updates to in-memory state.
- Uses GET status endpoint on reconnect and as safety reconciliation.

## Event contract

### Client -> Server

- `hubdo.bulk.subscribe`
  - payload: `{ "jobId": "uuid" }`
- `hubdo.bulk.unsubscribe`
  - payload: `{ "jobId": "uuid" }`

### Server -> Client

- `hubdo.bulk.job.subscribed`
  - payload: `{ "jobId": "uuid", "connectedAt": "iso-date" }`

- `hubdo.bulk.item.updated`
  - payload:

```json
{
  "jobId": "uuid",
  "itemId": "uuid",
  "cpf": "12345678901",
  "status": "processing",
  "attemptCount": 1,
  "updatedAt": "iso-date",
  "errorCode": null,
  "errorMessage": null,
  "creditosConsumidos": 0,
  "origin": null
}
```

- `hubdo.bulk.job.updated`
  - payload:

```json
{
  "jobId": "uuid",
  "status": "processing",
  "summary": {
    "total": 100,
    "queued": 44,
    "processing": 4,
    "success": 50,
    "error": 2,
    "deadLetter": 0
  },
  "updatedAt": "iso-date"
}
```

- `hubdo.bulk.job.completed`
- `hubdo.bulk.job.failed`

## Worker emission sequence

1. Consume message (`itemId`, `jobId`, `cpf`, `mode`).
2. Persist transition to `processing`.
3. Emit `hubdo.bulk.item.updated` and `hubdo.bulk.job.updated`.
4. Execute HubDo lookup.
5. Persist terminal status (`success` or `error`, or `dead_letter` when applicable).
6. Emit updated item and job snapshots.
7. If job terminal, emit `hubdo.bulk.job.completed` or `hubdo.bulk.job.failed` once.
8. Ack message.

## Delivery and consistency rules

- Emit socket events only after database commit for each transition.
- Use database as source of truth; socket events are projections.
- Frontend must reconcile with GET status endpoint after reconnect.
- Event ordering is best-effort; clients should apply updates using `updatedAt` and item status precedence.

## Socket namespace and rooms

- Namespace: `/hubdo-bulk`.
- Room convention: `hubdo:job:{jobId}`.
- Server validates `jobId` format and access policy before join.

## Security and auth

- Reuse existing auth/session middleware for socket handshake.
- Reject subscription to job IDs outside user authorization scope.
- Avoid exposing RabbitMQ URLs, queue names, or secrets in events.

## Observability

- Structured logs for:
  - socket connects/disconnects,
  - room joins/leaves,
  - emission failures,
  - consumer-to-socket latency.
- Metrics:
  - connected clients,
  - events/sec by type,
  - p95 event latency,
  - reconnect rate.

## Dependencies

- `amqplib` for RabbitMQ producer/consumer runtime.
- `socket.io` for realtime server events.
- `socket.io-client` for frontend subscription.

## Error handling

- If socket emission fails, processing still commits and message ack path proceeds.
- Emission failures are logged and metric-counted.
- Frontend reconciliation endpoint guarantees eventual consistency.

## Testing strategy

### Unit

- room join/leave validation.
- event payload shape and serialization.
- status reducer behavior on out-of-order events.

### Integration

- enqueue job -> worker consumes -> socket client receives sequence.
- reconnect scenario with snapshot reconciliation.
- terminal event emitted once per job.

### Non-functional

- load test with concurrent jobs and multiple subscribers.
- verify no memory leaks in socket room lifecycle.

## Implementation traceability

1. Realtime server bootstrap

- `app/api/socket/route.ts` (or `server.ts` if custom Node server is chosen)

2. Worker + queue integration

- `src/queue/rabbitmq/connection.ts`
- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`
- `src/hubdoCpf/application/hubdo-bulk-lookup-worker.service.ts`

3. Frontend subscription + UI state updates

- `src/components/generator-cpf/generator-cpf-client.tsx`

4. Snapshot/reconciliation API

- `app/api/hubdo-cpf-lookup/bulk/[jobId]/route.ts`

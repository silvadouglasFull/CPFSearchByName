# ADR 0028 - Socket.io + amqplib for Realtime HubDo Bulk Lookup Status

## Status

Proposed

## Context

The current bulk HubDo flow already uses RabbitMQ for asynchronous processing and a status endpoint for polling. Polling works but has UX limitations:

- delayed status feedback by polling interval,
- unnecessary repeated HTTP reads,
- slower perception of progress for item-level transitions,
- harder to provide responsive operational UI for long-running jobs.

The product needs a robust custom UI where users can observe specific item/job states such as `processing`, `success`, and `error` in near real time.

## Decision

1. Keep RabbitMQ processing with amqplib as the backend execution backbone

- Worker continues consuming queue messages and persisting status transitions.
- No synchronous HubDo execution in request lifecycle.

2. Introduce Socket.io as realtime projection channel

- Workers emit status events to Socket.io after each persisted transition.
- Frontend subscribes to room scoped by `jobId`.

3. Adopt hybrid consistency model

- Database + status endpoint remain source of truth.
- Socket stream is used for immediate UX updates.
- On reconnect, frontend rehydrates from snapshot endpoint and resumes live events.

4. Standardize event contract per job/item

- Define explicit event names and payloads for item/job updates and terminal states.
- Emit terminal job event once per final transition.

## Consequences

### Positive

- Near real-time progress UX without aggressive polling.
- Better item-level visibility for operations and support.
- Lower average polling load while maintaining consistency guarantees.

### Negative

- Additional runtime complexity (socket server lifecycle, room management).
- New auth/authorization checks for socket subscriptions.
- Need to handle eventual ordering/reconnect edge cases.

### Mitigation

- Keep status endpoint as reconciliation fallback.
- Emit after DB commit only.
- Add structured logs, metrics, and integration tests for reconnect/ordering scenarios.

## Alternatives considered

1. Polling only

- Rejected for delayed UX and unnecessary repeated reads.

2. SSE (Server-Sent Events)

- Rejected for less flexible bidirectional room subscription model in this use case.

3. Managed pub/sub websocket provider

- Rejected at this stage to avoid external dependency and keep architecture aligned with current self-hosted stack.

## Related ADRs

- ADR 0019 - HubDo CPF WebService Integration
- ADR 0023 - Generator CPF Multi-Selection and Bulk HubDo Lookup
- ADR 0024 - RabbitMQ Queueing for HubDo Bulk CPF Lookup
- ADR 0027 - Enqueue Button in GeneratorCpfResultsTable for HubDo RabbitMQ Bulk Lookup

## Traceability

1. Queue consumer and worker status transitions

- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`
- `src/hubdoCpf/application/hubdo-bulk-lookup-worker.service.ts`

2. Realtime socket server and contract

- `app/api/socket/route.ts` (or custom server entrypoint)

3. Frontend subscription and UI updates

- `src/components/generator-cpf/generator-cpf-client.tsx`

4. Source-of-truth reconciliation

- `app/api/hubdo-cpf-lookup/bulk/[jobId]/route.ts`

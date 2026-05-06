# ADR 0027 - Enqueue Button in GeneratorCpfResultsTable for HubDo RabbitMQ Bulk Lookup

## Status

Proposed

## Context

The project already supports:

- CPF multi-selection in the generated CPF results flow,
- asynchronous bulk lookup via RabbitMQ,
- job status tracking through bulk lookup job endpoints.

However, the enqueue trigger must be explicit and discoverable exactly where users manage selected generated CPFs: in the header action group of `GeneratorCpfResultsTable`.

Current requirement:

- add a dedicated button in the table action row,
- enqueue selected CPFs to RabbitMQ-backed HubDo processing,
- preserve existing selection toggle and records badge behavior.

## Decision

1. Introduce a dedicated enqueue action in `GeneratorCpfResultsTable`

- Place a new button in the existing `flex items-center gap-2` header action container.
- Keep existing action order predictable:
  - selection toggle,
  - enqueue button,
  - records badge.

2. Keep orchestration in parent component

- `GeneratorCpfResultsTable` remains presentational.
- API invocation and queueing lifecycle state stay in `generator-cpf-client.tsx`.
- Table receives callbacks and state via props.

3. Use existing queue-first backend flow

- Enqueue button calls `POST /api/hubdo-cpf-lookup/bulk`.
- Endpoint persists job/items and publishes RabbitMQ messages.
- Request must return quickly with `202` and `jobId`.

4. Apply guardrails for UX and consistency

- Disable enqueue button when no selected CPFs.
- Disable while request is in-flight to prevent duplicate submissions.
- Preserve selected CPFs after success unless future UX decision states otherwise.

## Consequences

### Positive

- User intent is clear at the exact point where CPFs are selected.
- Queue-based architecture is reinforced; no accidental synchronous bulk execution.
- Existing backend and worker infrastructure is reused with minimal coupling.

### Negative

- Adds one more control in an already dense action row.
- Requires careful state handling between table and parent client.

### Mitigation

- Keep concise button labeling and loading/disabled states.
- Encapsulate enqueue state transitions in parent component handlers.
- Preserve presentational responsibility boundaries for table component.

## Related ADRs

- ADR 0023 - Generator CPF Multi-Selection and Bulk HubDo Lookup
- ADR 0024 - RabbitMQ Queueing for HubDo Bulk CPF Lookup
- ADR 0025 - Generator CPF History Records HubDo Lookup FK
- ADR 0026 - Generator CPF History Records Left Join HubDo Lookups

## Traceability

1. Table action placement

- `src/components/generator-cpf/generator-cpf-results-table.tsx`

2. Client-side enqueue orchestration

- `src/components/generator-cpf/generator-cpf-client.tsx`

3. Bulk enqueue and status APIs

- `app/api/hubdo-cpf-lookup/bulk/route.ts`
- `app/api/hubdo-cpf-lookup/bulk/[jobId]/route.ts`

4. Queue and worker path

- `src/queue/rabbitmq/publisher.ts`
- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`
- `src/hubdoCpf/application/hubdo-bulk-lookup-worker.service.ts`

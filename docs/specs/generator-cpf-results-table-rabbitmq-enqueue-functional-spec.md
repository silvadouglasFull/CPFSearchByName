# Functional Specification - GeneratorCpfResultsTable RabbitMQ Enqueue Action

## Objective

Add a dedicated action button in `GeneratorCpfResultsTable` to enqueue selected CPFs for asynchronous HubDo lookup through RabbitMQ.

## Scope

- Add one new button to the results-table header action group.
- Keep existing selection toggle behavior.
- Trigger queue-based bulk lookup flow (job creation + enqueue), not synchronous processing.
- Return immediate feedback (`jobId` and queued summary) to the UI.
- Preserve current badge and records count display.

## Out of scope

- Changing HubDo lookup business rules.
- Replacing the existing status polling endpoint.
- Implementing retry UI flows for failed items.

## User journey

### Journey 1: Queue selected CPFs

1. User enables selection mode in `GeneratorCpfResultsTable`.
2. User selects one or more CPF records.
3. User clicks the new action button in the same header action group where selection toggle and badge are rendered.
4. Frontend calls `POST /api/hubdo-cpf-lookup/bulk` with selected CPFs.
5. Backend creates a bulk job, enqueues items in RabbitMQ, and responds with `jobId` and status `queued`.
6. UI presents success feedback and starts job status polling.

### Journey 2: Validation feedback

1. If no CPF is selected, the enqueue button remains disabled.
2. If request is in-flight, enqueue button remains disabled and shows loading state.
3. If API validation fails, user sees an actionable error message.

## UI placement requirement

Button placement must be in the existing header action container:

```jsx
<div className="flex items-center gap-2">
  {onToggleSelectionMode ? (
    <Button ...>
      {selectionEnabled ? 'Disable selection' : 'Enable selection'}
    </Button>
  ) : null}
  {/* New enqueue button here */}
  <Badge ...>{records.length}</Badge>
</div>
```

## Inputs

### UI state

- `selectionEnabled: boolean`
- `selectedCpfs: string[]`
- `isQueueing: boolean`
- `bulkMode: 'normal' | 'turbo'`

### API request

- `cpfs: string[]` (required; normalized and deduplicated server-side)
- `mode: 'normal' | 'turbo'` (required)

## Outputs

### UI output

- Disabled/enabled enqueue button state.
- Loading state while creating queue job.
- Immediate confirmation with `jobId` and queued item count.

### API output

- `jobId`
- `status` (`queued`)
- `summary` (`total`, `queued`, `processing`, `success`, `error`)

## Business rules

- Enqueue action requires at least one selected CPF.
- User cannot submit duplicate enqueue requests while one request is in progress.
- Selection state remains unchanged after successful enqueue (unless a future UX rule changes this explicitly).
- The enqueue action must use RabbitMQ-backed bulk flow and never perform synchronous HubDo processing in the request lifecycle.

## Non-functional requirements

- Header action row must stay responsive on mobile and desktop.
- Action controls must keep existing keyboard accessibility patterns.
- User feedback must be shown in under 200 ms after API response arrival.

## Acceptance criteria

- New enqueue button is visible in the same action cluster as selection toggle and badge.
- Button is disabled when `selectedCpfs.length === 0`.
- Button shows loading state during request and prevents double-click submissions.
- API call returns `202` with `jobId` and queued summary.
- Worker consumption remains asynchronous via RabbitMQ (no blocking lookup in API request).
- Existing `Enable selection` / `Disable selection` behavior is preserved.

## Requirement traceability

1. Results table UI action placement

- `src/components/generator-cpf/generator-cpf-results-table.tsx`

2. Client-side enqueue orchestration and feedback

- `src/components/generator-cpf/generator-cpf-client.tsx`

3. Bulk enqueue API

- `app/api/hubdo-cpf-lookup/bulk/route.ts`

4. RabbitMQ publisher and worker integration

- `src/queue/rabbitmq/publisher.ts`
- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`
- `src/hubdoCpf/application/hubdo-bulk-lookup.service.ts`
- `src/hubdoCpf/application/hubdo-bulk-lookup-worker.service.ts`

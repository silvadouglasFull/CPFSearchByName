# Technical Specification - GeneratorCpfResultsTable Enqueue Button for HubDo RabbitMQ Flow

## Overview

This change introduces a dedicated enqueue button in `GeneratorCpfResultsTable` that triggers the existing RabbitMQ-backed HubDo bulk lookup pipeline.

## Architecture impact

1. UI component (`GeneratorCpfResultsTable`)

- Add one new button prop contract for enqueue action.
- Render button in the header action group between selection toggle and records badge.
- Keep table as presentational component; no direct API call from table.

2. Client orchestrator (`generator-cpf-client.tsx`)

- Hold queueing/loading state.
- Build payload from selected CPFs.
- Call bulk enqueue endpoint.
- Start/continue polling by returned `jobId`.

3. Backend/API (`POST /api/hubdo-cpf-lookup/bulk`)

- Validate payload.
- Create bulk job + items in DB.
- Publish one message per item to RabbitMQ.
- Return `202` with job summary.

4. Queue/worker

- Existing consumer continues processing asynchronously and updating statuses.

## UI contract

### Component props additions

`GeneratorCpfResultsTable` should receive:

- `onEnqueueSelectedCpfs?: () => void`
- `isEnqueueingSelectedCpfs?: boolean`
- `selectedCount?: number`

Notes:

- `selectedCount` is derived in parent from selected CPF state.
- If `onEnqueueSelectedCpfs` is undefined, button is hidden (keeps reusability).

### Rendering logic

Pseudo-rule set:

1. If `onEnqueueSelectedCpfs` exists, render enqueue button.
2. Disable when `selectedCount <= 0` or `isEnqueueingSelectedCpfs` is `true`.
3. Keep `Enable/Disable selection` button untouched.
4. Keep badge rendering untouched.

## API contract

### Endpoint

- `POST /api/hubdo-cpf-lookup/bulk`

### Request

```json
{
  "cpfs": ["12345678901", "98765432100"],
  "mode": "normal"
}
```

### Response (`202 Accepted`)

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

## Sequence flow

1. User clicks enqueue button in table header.
2. Parent component reads selected CPFs and validates non-empty selection.
3. Parent sends request to bulk route.
4. Route persists job and items through `drizzle-hubdo-bulk-lookup.repository`.
5. Route publishes item messages using RabbitMQ publisher.
6. Route returns `jobId` and queued summary.
7. Parent stores `jobId` and polls status endpoint for progress updates.

## State management and UX rules

- `isEnqueueingSelectedCpfs` must become `true` before request dispatch and `false` in `finally` block.
- While `isEnqueueingSelectedCpfs` is true:
  - enqueue button disabled,
  - selection toggle optionally disabled if existing UX rule requires consistency.
- On success:
  - persist `jobId` for polling,
  - surface queued confirmation.
- On error:
  - preserve selection,
  - surface message and allow retry.

## Error handling

- `400`: invalid body, empty cpfs, invalid mode -> show validation message.
- `202`: accepted enqueue -> show queued state and begin polling.
- `500`: unexpected enqueue failure -> show retryable error.

## Observability

- Log enqueue request with:
  - `jobId`,
  - selected count,
  - mode,
  - request latency.
- Log publish failures per item with item id and CPF hash (never raw CPF in error logs if policy forbids).

## Security and compliance

- Do not expose internal broker details in API response.
- Respect CPF logging policy from existing encryption/lookup conventions.
- Keep server-only RabbitMQ credentials in env variables.

## Testing strategy

### Unit/UI

- `GeneratorCpfResultsTable` renders enqueue button only when callback prop exists.
- Button disabled when `selectedCount` is zero.
- Button click invokes `onEnqueueSelectedCpfs` once.
- Loading state disables repeated submissions.

### API/service

- Valid payload returns `202` with `jobId`.
- Empty `cpfs` returns `400`.
- Publish failure is handled and mapped to non-success response policy.

### Integration

- Enqueue through API creates rows in `hubdo_bulk_lookup_jobs` and `hubdo_bulk_lookup_job_items`.
- Published messages are consumed and item statuses evolve.

## Implementation traceability

1. Table action UI

- `src/components/generator-cpf/generator-cpf-results-table.tsx`

2. Parent orchestration

- `src/components/generator-cpf/generator-cpf-client.tsx`

3. Enqueue API

- `app/api/hubdo-cpf-lookup/bulk/route.ts`

4. Job status polling target

- `app/api/hubdo-cpf-lookup/bulk/[jobId]/route.ts`

5. Repository and queue adapters

- `src/hubdoCpf/infrastructure/drizzle-hubdo-bulk-lookup.repository.ts`
- `src/queue/rabbitmq/connection.ts`
- `src/queue/rabbitmq/publisher.ts`
- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`

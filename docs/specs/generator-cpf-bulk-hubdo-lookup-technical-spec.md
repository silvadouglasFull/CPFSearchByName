# Technical Specification - Generator CPF Bulk HubDo Lookup

## Overview

Implement multi-selection in generated CPF results and bulk HubDo lookup orchestration reusing `HubdoCpfLookupService.lookup`.

## Architecture

### Frontend

1. `GeneratorCpfClient`

- Add local state:
  - `isSelectionEnabled: boolean`
  - `selectedCpfs: string[]`
  - `isBulkLookupLoading: boolean`
  - `bulkLookupResult` (summary + items)
  - `bulkLookupErrorMessage: string | null`
- Add handlers:
  - `toggleSelectionMode()`
  - `toggleCpfSelection(cpf: string)`
  - `clearSelection()`
  - `handleBulkLookup()`

2. `GeneratorCpfResultsTable`

- Extend props:
  - `selectionEnabled: boolean`
  - `selectedCpfs: string[]`
  - `onToggleSelectionMode: () => void`
  - `onToggleCpfSelection: (cpf: string) => void`
- Add menu area action button:
  - `Enable selection` when off
  - `Disable selection` when on
- In `TableBody`, prepend checkbox cell when `selectionEnabled` is true.

### Backend

1. New route

- `POST /api/hubdo-cpf-lookup/bulk`
- Runtime: `nodejs`
- Request body:
  - `cpfs: string[]`
  - `mode?: 'normal' | 'turbo'`

2. Bulk orchestration

- Instantiate service via `createHubdoCpfLookupService()`.
- For each CPF call `service.lookup({ cpf, mode })`.
- Use bounded concurrency (recommended 3 to 5 parallel lookups) to avoid overload.
- Aggregate item-level responses into one payload.

## API contract

### Request

```json
{
  "cpfs": ["12345678901", "98765432100"],
  "mode": "normal"
}
```

### Response

```json
{
  "summary": {
    "total": 2,
    "success": 1,
    "error": 1
  },
  "items": [
    {
      "cpf": "12345678901",
      "status": "success",
      "creditosConsumidos": 5,
      "origem": "receita_federal"
    },
    {
      "cpf": "98765432100",
      "status": "error",
      "errorCode": "CPF_NOT_FOUND",
      "message": "CPF not found",
      "creditosConsumidos": 0
    }
  ]
}
```

## Validation rules

- Reject empty `cpfs` list with HTTP 400.
- Deduplicate repeated CPFs before execution.
- Enforce upper bound per request (recommended max 100 CPFs).
- Reject invalid `mode` values.

## Error handling

- One CPF failure must not fail entire batch.
- Route returns HTTP 200 for processed batch with mixed outcomes.
- Route returns HTTP 400 only for malformed input.
- Route returns HTTP 500 for unexpected orchestration errors before processing.

## UI behavior details

- Bulk button disabled when:
  - no selected CPFs,
  - or bulk request in progress.
- Selection mode toggle clears selection when disabled.
- Feedback blocks:
  - summary message (`X success, Y errors`),
  - optional table/list of item-level errors.

## Type additions

File: `src/components/generator-cpf/types.ts`

- `BulkHubdoLookupItemResult`
- `BulkHubdoLookupSummary`
- `BulkHubdoLookupResponse`

## Build and validation

- `npm run lint`
- `npm run build`

## Manual verification checklist

1. Generate candidates and enable selection mode.
2. Verify checkboxes appear in `TableBody` rows.
3. Select multiple CPFs and run bulk lookup.
4. Confirm backend called once with CPF list.
5. Confirm mixed success/error results are shown correctly.
6. Disable selection mode and verify selection is cleared.

## Implementation traceability

1. Generator result table

- `src/components/generator-cpf/generator-cpf-results-table.tsx`

2. Generator client orchestration

- `src/components/generator-cpf/generator-cpf-client.tsx`

3. Bulk API endpoint

- `app/api/hubdo-cpf-lookup/bulk/route.ts`

4. HubDo lookup service reused

- `src/hubdoCpf/application/hubdo-cpf-lookup.service.ts`

# Technical Specification - Generator CPF History Bulk Selection

## Overview

Extend `generator-cpf` history details flow so snapshot CPFs can be selected and submitted to the existing bulk HubDo endpoint.

## Current baseline

- Search tab already supports selection + bulk lookup for freshly generated records.
- History tab can load snapshots and display `resultRecords`, but bulk selection flow is not yet wired for snapshot records.

## Target architecture

### Frontend: `GeneratorCpfClient`

Add history-specific bulk selection state (or carefully reuse generic state with strict reset rules):

- `historySelectionEnabled: boolean`
- `selectedHistoryCpfs: string[]`
- `historyBulkLookupMode: 'normal' | 'turbo'`
- `isHistoryBulkLookupLoading: boolean`
- `historyBulkLookupResult: BulkHubdoLookupResponse | null`
- `historyBulkLookupErrorMessage: string | null`

Required handlers:

- `toggleHistorySelectionMode()`
- `toggleHistoryCpfSelection(cpf: string)`
- `handleHistoryBulkLookup()`
- `resetHistorySelectionState()` (called on snapshot change/close)

### Frontend: `GeneratorCpfResultsTable`

No new API is required in the table component if current selection props are generic and reusable.

History details rendering should pass:

- `records={selectedHistoryItem.resultRecords}`
- `selectionEnabled={historySelectionEnabled}`
- `selectedCpfs={selectedHistoryCpfs}`
- `onToggleSelectionMode={toggleHistorySelectionMode}`
- `onToggleCpfSelection={toggleHistoryCpfSelection}`

### Backend

Reuse existing endpoint:

- `POST /api/hubdo-cpf-lookup/bulk`

No backend contract changes are required for this slice.

## UI flow details

When a snapshot is opened:

1. Render snapshot detail card.
2. Render `GeneratorCpfResultsTable` with history selection wiring.
3. Show history-specific bulk action row:
   - selected count label,
   - mode selector,
   - action button.
4. On submit, call bulk endpoint with `selectedHistoryCpfs`.
5. Render summary/error feedback below action row.

## State-reset rules

Reset history selection state when:

- user opens another snapshot,
- user closes history details,
- user switches away from `History` tab,
- selection mode is disabled.

## Validation rules

- Block submit when `selectedHistoryCpfs.length === 0`.
- Keep button disabled while request is running.
- Deduplicate selected CPF list before request (defensive).

## API payload

```json
{
  "cpfs": ["12345678901", "98765432100"],
  "mode": "turbo"
}
```

## Feedback format

Success message should include:

- `success`
- `error`
- `total`
- lookup mode (`normal` or `turbo`)

Example:

- `8 success, 2 error(s), 10 processed in turbo mode.`

## Build and validation

- `npm run lint`
- `npm run build`

Manual checks:

1. Open History tab and load snapshot details.
2. Enable selection and mark multiple CPFs.
3. Run bulk lookup in `normal` mode.
4. Run bulk lookup in `turbo` mode.
5. Verify reset behavior when switching snapshots.
6. Confirm Search-tab bulk flow remains unaffected.

## Implementation traceability

1. History orchestration

- `src/components/generator-cpf/generator-cpf-client.tsx`

2. Table reuse

- `src/components/generator-cpf/generator-cpf-results-table.tsx`

3. Bulk endpoint

- `app/api/hubdo-cpf-lookup/bulk/route.ts`

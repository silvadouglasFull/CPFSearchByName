# Functional Specification - Generator CPF Bulk HubDo Lookup

## Objective

Allow users to select multiple generated CPFs in `GeneratorCpfResultsTable` and run bulk official lookup using HubDo.

## Scope

- Add selection mode toggle in generated CPF results menu.
- Add per-row checkbox selection in `TableBody`.
- Execute bulk lookup for selected CPFs using backend integration with `HubdoCpfLookupService.lookup`.
- Display bulk execution feedback with success/error totals and item-level outcomes.

## User journey

1. User generates CPF candidates.
2. In the generated results table, user clicks menu action `Enable selection`.
3. Table shows checkbox control in each row inside `TableBody`.
4. User selects one or more CPFs.
5. User triggers `Bulk lookup` action.
6. System sends selected CPFs to backend bulk endpoint.
7. Backend executes HubDo lookup per selected CPF.
8. UI shows aggregate and item-level result feedback.

## Inputs

### UI input

- `selectionEnabled`: boolean
- `selectedCpfs`: string[]
- `mode`: `normal` | `turbo` (if reused from current flow)

### Bulk API request

- `cpfs: string[]` (required, at least 1)
- `mode?: 'normal' | 'turbo'`
- `birthDateByCpf?: Record<string, string>` (optional for future extension)

## Outputs

### UI output

- Selected counter (`N selected`).
- Disabled/enabled state for bulk action button.
- Execution feedback:
  - total processed,
  - success count,
  - error count,
  - list of per-CPF statuses.

### Bulk API response

- `summary`:
  - `total`
  - `success`
  - `error`
- `items[]` with:
  - `cpf`
  - `status`
  - `errorCode?`
  - `message?`
  - `creditosConsumidos`

## Business rules

- Selection mode is disabled by default.
- Checkboxes are visible only when selection mode is enabled.
- Bulk lookup action requires at least one selected CPF.
- Selecting/deselecting a row updates selection state immediately.
- Disabling selection mode clears current selection.
- Bulk execution must continue processing remaining CPFs even if one CPF fails.

## Non-functional requirements

- Responsive behavior must be preserved in desktop and mobile layouts.
- Bulk action feedback must be explicit and user-friendly.
- UI must prevent duplicate submissions while bulk request is in flight.

## Acceptance criteria

- `GeneratorCpfResultsTable` has menu action to enable/disable selection.
- `TableBody` rows display checkboxes when selection mode is active.
- User can select multiple CPFs and trigger bulk lookup.
- Backend processes selected CPFs using HubDo `lookup` service method.
- Response provides per-item and aggregate result.
- UI displays success/error totals and preserves usability on partial failures.

## Requirement traceability

1. Result table UI behavior

- `src/components/generator-cpf/generator-cpf-results-table.tsx`

2. Generator client state and bulk action

- `src/components/generator-cpf/generator-cpf-client.tsx`

3. Bulk API endpoint

- `app/api/hubdo-cpf-lookup/bulk/route.ts`

4. Service reused by bulk endpoint

- `src/hubdoCpf/application/hubdo-cpf-lookup.service.ts`

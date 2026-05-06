# Functional Specification - Generator CPF History Bulk Selection

## Objective

Allow users to select CPFs from saved history snapshots in `generator-cpf` (with `History` tab active) and run bulk HubDo lookup from those historical records.

## Scope

- Enable CPF multi-selection when viewing snapshot records in `History` tab.
- Reuse bulk lookup flow already available for generated records.
- Support mode selection (`normal` / `turbo`) for historical bulk lookup.
- Display aggregate bulk result feedback after execution.

## User journey

1. User opens `generator-cpf` page.
2. User switches to `History` tab.
3. User opens a saved snapshot details view.
4. Snapshot CPF records are displayed in `GeneratorCpfResultsTable`.
5. User clicks `Enable selection` in table menu.
6. User marks one or more CPF checkboxes in `TableBody`.
7. User selects HubDo lookup mode (`normal` or `turbo`).
8. User clicks bulk lookup action.
9. System submits selected CPF list to bulk endpoint.
10. UI shows processed summary (`success`, `error`, `total`) and mode used.

## Inputs

### UI inputs

- `historySnapshotId` (selected snapshot)
- `selectionEnabled` (boolean)
- `selectedCpfs` (string[])
- `bulkLookupMode` (`normal` | `turbo`)

### API input

- `POST /api/hubdo-cpf-lookup/bulk`
- body:
  - `cpfs: string[]`
  - `mode: 'normal' | 'turbo'`

## Outputs

### UI outputs

- Selection counter for snapshot records.
- Enabled/disabled bulk lookup button.
- Result feedback message containing:
  - processed total,
  - success count,
  - error count,
  - mode used.

## Business rules

- Selection mode in `History` is disabled by default.
- Checkboxes are shown only when selection mode is enabled.
- Bulk lookup from history requires at least one selected CPF.
- Turning selection mode off clears current snapshot selection.
- Selection state must reset when user switches snapshot details.
- Bulk execution must continue for remaining CPFs even if one CPF fails.

## Non-functional requirements

- Preserve responsive layout in history details view.
- Keep interaction parity between Search-tab and History-tab bulk flows.
- Avoid duplicate submissions while request is in progress.

## Acceptance criteria

- User can enable selection in history snapshot CPF table.
- User can select multiple snapshot CPFs and run bulk lookup.
- Bulk mode selector is available in history flow.
- Bulk feedback appears after request completion with aggregate summary.
- Snapshot selection is reset safely on snapshot change and mode disable.

## Requirement traceability

1. History flow orchestration

- `src/components/generator-cpf/generator-cpf-client.tsx`

2. Reused result table with selection controls

- `src/components/generator-cpf/generator-cpf-results-table.tsx`

3. Bulk API consumed

- `app/api/hubdo-cpf-lookup/bulk/route.ts`

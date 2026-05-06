# ADR 0023 - Generator CPF Multi-Selection and Bulk HubDo Lookup

## Status

Proposed

## Context

The generator CPF flow already lists generated candidates in `GeneratorCpfResultsTable`, but users must run HubDo lookups one by one in separate flows.

A new requirement requests:

- multi-selection directly in generated CPF results,
- a menu action to enable selection mode,
- row checkbox controls inside `TableBody`,
- bulk CPF lookup using `HubdoCpfLookupService.lookup`.

The existing HubDo lookup service is server-side and already encapsulates validation, external API orchestration, and persistence. Therefore, bulk processing must be implemented via backend orchestration and not by exposing service internals to the frontend.

## Decision

1. Add selection mode to generated CPF result table

- `GeneratorCpfResultsTable` receives a selection mode toggle controlled by parent state.
- A menu area in the table header includes one action button: `Enable selection` / `Disable selection`.
- When selection mode is enabled, each row in `TableBody` renders a checkbox to select CPF for bulk lookup.

2. Keep source of truth in parent client component

- Selected CPF values are stored in `generator-cpf-client.tsx`, not inside table row components.
- `GeneratorCpfResultsTable` remains a presentational component receiving:
  - `selectionEnabled`,
  - `selectedCpfs`,
  - callbacks for toggle/select.

3. Process bulk lookup through a dedicated API endpoint

- Introduce a backend route (e.g. `POST /api/hubdo-cpf-lookup/bulk`) that receives selected CPF list and mode.
- The route uses `createHubdoCpfLookupService()` and invokes `lookup` for each CPF.
- Frontend never calls service classes directly.

4. Return structured per-item result

- Bulk API returns:
  - item-level result status,
  - success/error metadata per CPF,
  - aggregate summary (`total`, `success`, `error`).

5. Preserve current HubDo lookup guarantees

- Reuse existing lookup service behavior for validation, origin mapping, persistence, and error mapping.
- Failures in one CPF must not abort processing of all other selected CPFs.

## Consequences

### Positive

- Operators can verify multiple generated CPFs in one action.
- Existing HubDo service logic is reused, reducing duplication.
- Audit persistence remains centralized in current HubDo repository/service flow.

### Negative

- More UI state complexity in Generator CPF client.
- Bulk calls can increase HubDo credit consumption quickly.
- Requires careful handling of partial failures and user feedback.

### Mitigation

- Show selected count and explicit confirmation before submission.
- Return item-level outcomes and aggregate totals.
- Apply conservative batching/concurrency limits in bulk API implementation.

## Related ADRs

- ADR 0016 - generatorCpf History UI Tabs and Save Action
- ADR 0019 - HubDo CPF WebService Integration
- ADR 0020 - HubDo CPF Lookup UI Page with Search and History

## Traceability

1. Generator results table

- `src/components/generator-cpf/generator-cpf-results-table.tsx`

2. Generator client orchestration

- `src/components/generator-cpf/generator-cpf-client.tsx`

3. HubDo service orchestration

- `src/hubdoCpf/application/hubdo-cpf-lookup.service.ts`

4. Bulk lookup endpoint

- `app/api/hubdo-cpf-lookup/bulk/route.ts`

# ADR 0016 - generatorCpf History UI Tabs and Save Action

## Status

Accepted

## Context

ADR 0015 introduced persistence for generatorCpf history with CRUD and paginated API routes.
The current generatorCpf UI still exposes only transient generation output and does not consume this persisted history.

A new requirement introduces:

- tabbed UI on generatorCpf page,
- explicit save action for generated records,
- paginated history visualization with saved generation metadata.

## Decision

1. Tabbed experience

- Refactor generatorCpf client to use two tabs:
  - Search: generate CPF candidates and save current snapshot.
  - History: list persisted generation snapshots.

2. Save action behavior

- Add `Salvar Resultados` button in Search tab.
- Save operation calls `POST /api/generator-cpf-history` with:
  - `partialCpf`,
  - `stateRegionDigit`,
  - `records`.
- Button is enabled only when generation has records.

3. History visualization

- History tab consumes `GET /api/generator-cpf-history?page=&pageSize=`.
- Render table with:
  - partial CPF,
  - state region digit,
  - saved result count,
  - creation timestamp.
- Keep latest-first ordering from API and support previous/next pagination.

4. Type contracts for UI

- Extend generatorCpf client-side types with history payload interfaces:
  - history record,
  - paginated history response.

## Consequences

- Generated CPF snapshots become visible directly in product UI.
- Users can save and revisit previous generation outputs without re-running generation.
- Additional client state management is introduced for tabs, save status, and history pagination.

## Related ADRs

- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0008 - generator-cpf Module Reuse as Next.js Page with Sidebar Link
- ADR 0014 - filter-by-cpf Search History Persistence and UI Tabs
- ADR 0015 - generatorCpf History Persistence

## Traceability

1. UI client and state

- `src/components/generator-cpf/generator-cpf-client.tsx`

2. History table component

- `src/components/generator-cpf/generator-cpf-history-table.tsx`

3. UI type contracts

- `src/components/generator-cpf/types.ts`

4. Existing history APIs consumed by UI

- `app/api/generator-cpf-history/route.ts`
- `app/api/generator-cpf-history/[id]/route.ts`

# ADR 0017 - generatorCpf History with Normalized CPF Records and History Details Action

## Status

Accepted

## Context

ADR 0015 introduced persistence for generatorCpf history in a single table using JSON payload (`result_records`).
ADR 0016 introduced tabbed UI with History listing.

A new requirement now demands:

- storing each generated CPF as a relational row linked to its snapshot,
- preserving snapshot summary in the history table,
- exposing an action in History tab to visualize CPF records generated for each snapshot.

## Decision

1. Normalized persistence model

- Keep `generator_cpf_history` as snapshot summary table.
- Create a new table `generator_cpf_history_records` with FK to snapshot id:
  - `history_id` -> `generator_cpf_history.id`.
- Persist each generated CPF candidate in this child table.

2. Data ownership and referential integrity

- Child rows are owned by snapshot rows.
- FK must enforce `ON DELETE CASCADE`, ensuring child records are removed when snapshot is deleted.

3. Repository behavior

- `create` inserts snapshot summary and child CPF records in the same transaction.
- `update` can replace child CPF list transactionally when records are provided.
- `getById` returns snapshot with child CPF list.
- `list` returns summary data for History tab; full CPF list is loaded on-demand by id.

4. UI behavior in History tab

- Add action button per snapshot row: `Visualizar CPFs`.
- Clicking action fetches details from `GET /api/generator-cpf-history/[id]`.
- UI renders the persisted CPF list for the selected snapshot.

## Consequences

- Storage model becomes queryable and relationally consistent.
- Snapshot summaries remain lightweight while details are fetched only when requested.
- Additional table and transactional logic increase implementation complexity.

## Related ADRs

- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0014 - filter-by-cpf Search History Persistence and UI Tabs
- ADR 0015 - generatorCpf History Persistence
- ADR 0016 - generatorCpf History UI Tabs and Save Action

## Traceability

1. Schema

- `src/database/schema.ts`

2. Domain/application/infrastructure

- `src/generatorCpfHistory/domain/types.ts`
- `src/generatorCpfHistory/application/generator-cpf-history.service.ts`
- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`

3. API

- `app/api/generator-cpf-history/route.ts`
- `app/api/generator-cpf-history/[id]/route.ts`

4. UI

- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-history-table.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`

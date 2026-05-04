# ADR 0018 - getCpfsByName Search History Persistence and UI Tabs with Details

## Status

Accepted

## Context

The current getCpfsByName flow performs transient name searches across portal pages and collects records in memory, then outputs to JSON.
Search name inputs and result lists are not persisted in the application database, preventing auditability and reuse of previous collection runs.

A new requirement introduces:

- persistence of searched name and corresponding result snapshot,
- repository and service layer for CRUD and paginated listing,
- UI tabs separating live search from history visualization,
- explicit save action from the search tab,
- on-demand detail visualization showing persisted result records per snapshot.

## Decision

1. Normalized persistence model

- Create `get_cpfs_by_name_search_history` table for snapshot summaries:
  - searched name,
  - result count,
  - timestamps.
- Create `get_cpfs_by_name_search_records` table for individual records (FK to snapshot).
- Each collected result persists as a child row.

2. Architecture pattern

- Repository pattern for data access.
- Service pattern for CRUD and business operations.
- Drizzle ORM as persistence implementation.
- Transactional save and update to maintain consistency.

3. API layer

- `POST /api/get-cpfs-by-name-history` to persist a search snapshot.
- `GET /api/get-cpfs-by-name-history` for paginated listing.
- `GET|PUT|DELETE /api/get-cpfs-by-name-history/[id]` for CRUD by id.

4. UI behavior

- `app/get-cpfs-by-name/page.tsx` experience is tabbed:
  - Tab 1: Search and immediate results collection.
  - Tab 2: Search history list (paginated).
- Search tab contains `Salvar Resultados` button that persists current collection via API.
- History tab includes action button `Visualizar Resultados` per snapshot to fetch and display persisted records.

## Consequences

- Search runs become queryable and auditable.
- Users can revisit historical result snapshots without re-running collections.
- Additional storage growth is expected due to persisted result payloads.
- Transactional logic increases implementation complexity.

## Related ADRs

- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0010 - get-cpfs-by-name Collection Progress UI
- ADR 0014 - filter-by-cpf Search History Persistence and UI Tabs
- ADR 0015 - generatorCpf History Persistence
- ADR 0017 - generatorCpf History with Normalized CPF Records

## Traceability

1. Schema

- `src/database/schema.ts`

2. Domain/application/infrastructure

- `src/getCpfsByNameHistory/domain/types.ts`
- `src/getCpfsByNameHistory/application/get-cpfs-by-name-history.service.ts`
- `src/getCpfsByNameHistory/infrastructure/drizzle-get-cpfs-by-name-history.repository.ts`
- `src/getCpfsByNameHistory/index.ts`

3. API

- `app/api/get-cpfs-by-name-history/route.ts`
- `app/api/get-cpfs-by-name-history/[id]/route.ts`

4. UI

- `src/components/get-cpfs-by-name/get-cpfs-by-name-client.tsx`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-history-table.tsx`
- `app/get-cpfs-by-name/page.tsx`

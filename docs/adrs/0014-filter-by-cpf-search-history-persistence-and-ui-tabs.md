# ADR 0014 - filter-by-cpf Search History Persistence and UI Tabs

## Status

Accepted

## Context

The current filter-by-cpf flow only performs transient searches against `resultados_portal.json`.
Search terms and results are not persisted, which prevents auditability and reuse of previous lookups.

A new requirement introduces:

- persistence of searched CPF terms and corresponding results,
- a repository + service layer for CRUD and paginated listing,
- UI tabs separating live search from history visualization,
- explicit save action from the search tab.

## Decision

1. Persistence model

- A new table `filter_cpf_search_history` stores:
  - searched CPF term,
  - serialized result set,
  - result count,
  - timestamps.

2. Architecture pattern

- Repository pattern for data access.
- Service pattern for orchestration and CRUD behavior.
- Drizzle ORM remains the persistence implementation.

3. API layer

- `POST /api/filter-by-cpf-history` to persist a search result snapshot.
- `GET /api/filter-by-cpf-history` for paginated listing.
- `GET|PUT|DELETE /api/filter-by-cpf-history/[id]` for CRUD by id.

4. UI behavior

- `app/filter-by-cpf/page.tsx` experience is tabbed:
  - Tab 1: Search and immediate results.
  - Tab 2: Search history list (paginated).
- Search tab contains `Salvar Resultados` button that persists the current search records through the new API.

## Consequences

- Search history becomes queryable and auditable.
- Users can revisit historical result snapshots without re-running live searches.
- Additional storage growth is expected due to persisted result payloads.

## Related ADRs

- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0006 - filter-by-cpf Refactor to Next.js BFF and Componentized UI
- ADR 0011 - User Settings Persistence with PostgreSQL, Docker, and Drizzle ORM
- ADR 0012 - Global get-cpfs-by-name Settings Persistence

## Traceability

1. Schema

- `src/database/schema.ts`

2. Domain/application/infrastructure

- `src/filterCpfHistory/domain/types.ts`
- `src/filterCpfHistory/application/filter-cpf-history.service.ts`
- `src/filterCpfHistory/infrastructure/drizzle-filter-cpf-history.repository.ts`
- `src/filterCpfHistory/index.ts`

3. API

- `app/api/filter-by-cpf-history/route.ts`
- `app/api/filter-by-cpf-history/[id]/route.ts`

4. UI

- `src/components/filter-by-cpf/filter-cpf-client.tsx`
- `src/components/filter-by-cpf/filter-cpf-history-table.tsx`
- `app/filter-by-cpf/page.tsx`

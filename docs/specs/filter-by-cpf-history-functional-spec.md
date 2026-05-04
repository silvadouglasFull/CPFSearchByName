# Functional Specification - filter-by-cpf Search History

## Objective

Persist search operations from the filter-by-cpf flow so users can review historical CPF queries and saved result snapshots.

## Scope

- Persist searched CPF term and result list.
- Provide CRUD operations through service/repository and API routes.
- Provide paginated history listing.
- Refactor filter page into tabs:
  - search tab,
  - history tab.
- Add `Salvar Resultados` action in search tab.

## User journey

1. User opens filter-by-cpf page.
2. User searches by partial CPF and sees live results.
3. User clicks `Salvar Resultados`.
4. System persists searched CPF + result snapshot.
5. User switches to `Histórico` tab.
6. System lists saved searches with pagination.

## Inputs

- `partialCpf` used in search.
- `records` result set returned by filter endpoint.
- Pagination query parameters:
  - `page` (default 1),
  - `pageSize` (default 10).

## Outputs

- Saved history record containing:
  - search term,
  - saved result list,
  - total results,
  - timestamps.
- Paginated listing with items and pagination metadata.

## Business rules

- `Salvar Resultados` is enabled only when there are records loaded.
- History listing is ordered by latest first.
- Pagination must support page and pageSize parameters.
- CRUD endpoints must exist for history schema.

## Non-functional requirements

- Responsive UI and reusable components.
- Friendly error/success feedback for save and listing operations.

## Acceptance criteria

- New schema persists searched CPF and result snapshot.
- Repository and service implement CRUD + paginated list.
- Search tab includes `Salvar Resultados` and saves successfully.
- History tab shows paginated saved entries.

## Requirement Traceability

1. Persistence and contracts

- `src/database/schema.ts`
- `src/filterCpfHistory/domain/types.ts`

2. Business layer

- `src/filterCpfHistory/application/filter-cpf-history.service.ts`

3. Data access layer

- `src/filterCpfHistory/infrastructure/drizzle-filter-cpf-history.repository.ts`

4. API routes

- `app/api/filter-by-cpf-history/route.ts`
- `app/api/filter-by-cpf-history/[id]/route.ts`

5. UI tabs and actions

- `src/components/filter-by-cpf/filter-cpf-client.tsx`
- `src/components/filter-by-cpf/filter-cpf-history-table.tsx`

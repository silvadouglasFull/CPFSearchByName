# Functional Specification - getCpfsByName Search History Persistence

## Objective

Persist name search operations and result snapshots from the getCpfsByName flow so users can review historical collection runs and saved result sets.

## Scope

- Persist searched name and result list with record count.
- Provide CRUD operations through service/repository and API routes.
- Provide paginated history listing.
- Refactor getCpfsByName page into tabs:
  - search tab,
  - history tab.
- Add `Salvar Resultados` action in search tab.
- Add `Visualizar Resultados` action in history tab rows.

## User journey

1. User opens getCpfsByName page.
2. User enters name and collects records (via SSE streaming).
3. User sees collected results and clicks `Salvar Resultados`.
4. System persists searched name + result snapshot with records.
5. User switches to `Histórico` tab.
6. System lists saved searches with pagination.
7. User clicks `Visualizar Resultados` on a row.
8. System loads and displays persisted records from selected snapshot.

## Inputs

Save operation:

- `searchName` used in collection.
- `records[]` result list returned by collection endpoint.

Pagination query parameters:

- `page` (default 1),
- `pageSize` (default 10).

Detail operation:

- `snapshotId`

## Outputs

Saved history record containing:

- search name,
- saved result list,
- total results,
- timestamps.

Paginated listing with items and pagination metadata.

Detail output:

- selected snapshot with full persisted result records.

## Business rules

- `Salvar Resultados` is enabled only when there are records collected.
- History listing is ordered by latest first.
- Pagination must support page and pageSize parameters.
- CRUD endpoints must exist for history schema.
- Each persisted record is linked to snapshot by FK with cascading delete.

## Non-functional requirements

- Responsive UI and reusable components.
- Friendly error/success feedback for save and listing operations.
- On-demand detail loading with loading/error states.

## Acceptance criteria

- New schema persists searched name and result snapshot.
- Repository and service implement CRUD + paginated list.
- Search tab includes `Salvar Resultados` and saves successfully.
- History tab shows paginated saved entries.
- Detail action fetches and displays persisted records from snapshot.

## Requirement Traceability

1. Persistence and contracts

- `src/database/schema.ts`
- `src/getCpfsByNameHistory/domain/types.ts`

2. Business layer

- `src/getCpfsByNameHistory/application/get-cpfs-by-name-history.service.ts`

3. Data access layer

- `src/getCpfsByNameHistory/infrastructure/drizzle-get-cpfs-by-name-history.repository.ts`

4. API routes

- `app/api/get-cpfs-by-name-history/route.ts`
- `app/api/get-cpfs-by-name-history/[id]/route.ts`

5. UI tabs and actions

- `src/components/get-cpfs-by-name/get-cpfs-by-name-client.tsx`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-history-table.tsx`

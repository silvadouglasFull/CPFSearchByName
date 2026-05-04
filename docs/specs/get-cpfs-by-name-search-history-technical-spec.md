# Technical Specification - getCpfsByName Search History Persistence

## Overview

Introduce normalized database persistence for getCpfsByName search snapshots using PostgreSQL + Drizzle, with repository/service module and tabbed UI for search vs. historical records.

## Data model

Table 1: `get_cpfs_by_name_search_history` (summary)

- `id` (uuid, pk)
- `search_name` (text, not null)
- `result_count` (int, not null)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

Table 2: `get_cpfs_by_name_search_records` (child rows)

- `id` (uuid, pk)
- `search_id` (uuid, not null, fk -> `get_cpfs_by_name_search_history.id`)
- `name` (text, not null)
- `cpf` (text, not null)
- `relation` (text, not null)
- `details_link` (text, not null)
- `source_page` (int, not null)
- `created_at` (timestamptz)

Constraint behavior:

- FK with `ON DELETE CASCADE`.

## Domain module

Path: `src/getCpfsByNameHistory/`

- `domain/types.ts`
  - `GetCpfsByNameHistoryRecord`
  - `CreateGetCpfsByNameHistoryInput`
  - `UpdateGetCpfsByNameHistoryInput`
  - `GetCpfsByNameHistoryListParams`
  - `PaginatedGetCpfsByNameHistory`
  - `GetCpfsByNameHistoryRepository`
- `application/get-cpfs-by-name-history.service.ts`
  - CRUD methods and paginated list orchestration
- `infrastructure/drizzle-get-cpfs-by-name-history.repository.ts`
  - Drizzle implementation for CRUD, pagination, and transactional operations
- `index.ts`
  - module exports and service factory

## API routes

1. `app/api/get-cpfs-by-name-history/route.ts`

- `POST`: create snapshot from search payload
- `GET`: list paginated snapshots with `page`, `pageSize`

2. `app/api/get-cpfs-by-name-history/[id]/route.ts`

- `GET`: fetch by id with full records
- `PUT`: update by id
- `DELETE`: remove by id

## Repository behavior

- `create`: inserts snapshot summary and child result records in transaction.
- `getById`: loads snapshot + all linked records.
- `list`: loads summary only (for History tab).
- `update`: updates summary and replaces child records transactionally.
- `delete`: deletes snapshot; child rows removed by cascade.

## UI refactor

File: `src/components/get-cpfs-by-name/get-cpfs-by-name-client.tsx`

- Add local tab state (`search` | `history`)
- Search tab:
  - existing search form/SSE collection/results table
  - `Salvar Resultados` button calling `POST /api/get-cpfs-by-name-history`
- History tab:
  - paginated fetch from `GET /api/get-cpfs-by-name-history`
  - reusable table component for snapshots with action button
  - detail loading on action click

File: `src/components/get-cpfs-by-name/get-cpfs-by-name-history-table.tsx`

- Render saved search snapshots with name, count, timestamp, and action button.

## Validation and error handling

- Save endpoint validates presence of `searchName` and `records` array.
- Pagination params normalized to safe positive integers.
- UI displays `FriendlyMessage` for save/list failures.

## Build and validation

- `pnpm db:generate`
- `pnpm db:push`
- `npm run lint`
- `npm run build`

## Implementation Traceability

1. Schema

- `src/database/schema.ts`

2. Module and persistence

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

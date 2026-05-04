# Technical Specification - filter-by-cpf Search History

## Overview

Introduce persistent history for filter-by-cpf searches using PostgreSQL + Drizzle, with a new repository/service module and tabbed UI that separates live search from historical records.

## Data model

Table: `filter_cpf_search_history`

- `id` (uuid, pk)
- `search_term` (text, not null)
- `result_records` (jsonb, not null)
- `result_count` (int, not null)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Domain module

Path: `src/filterCpfHistory/`

- `domain/types.ts`
  - `FilterCpfHistoryRecord`
  - `CreateFilterCpfHistoryInput`
  - `UpdateFilterCpfHistoryInput`
  - `FilterCpfHistoryListParams`
  - `PaginatedFilterCpfHistory`
  - `FilterCpfHistoryRepository`
- `application/filter-cpf-history.service.ts`
  - CRUD methods and paginated list orchestration
- `infrastructure/drizzle-filter-cpf-history.repository.ts`
  - Drizzle implementation for CRUD and pagination
- `index.ts`
  - module exports and service factory

## API routes

1. `app/api/filter-by-cpf-history/route.ts`

- `POST`: create history record from `{ partialCpf, records }`
- `GET`: list paginated history with `page`, `pageSize`

2. `app/api/filter-by-cpf-history/[id]/route.ts`

- `GET`: fetch by id
- `PUT`: update by id
- `DELETE`: remove by id

## UI refactor

File: `src/components/filter-by-cpf/filter-cpf-client.tsx`

- Add local tab state (`search` | `history`)
- Search tab:
  - existing search form/results
  - `Salvar Resultados` button calling `POST /api/filter-by-cpf-history`
- History tab:
  - paginated fetch from `GET /api/filter-by-cpf-history`
  - reusable table component for records

File: `src/components/filter-by-cpf/filter-cpf-history-table.tsx`

- Render saved history rows with search term, count, timestamp, and action to inspect saved result snapshot.

## Validation and error handling

- Save endpoint validates presence of `partialCpf` and `records` array.
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

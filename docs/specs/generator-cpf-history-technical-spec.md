# Technical Specification - generatorCpf History Persistence

## Overview

Introduce database persistence for generatorCpf historical snapshots with repository/service architecture and paginated API access.

## Data model

Table: `generator_cpf_history`

- `id` (uuid, pk)
- `partial_cpf` (text, not null)
- `state_region_digit` (text, nullable)
- `result_records` (jsonb, not null)
- `result_count` (int, not null)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

`result_records` JSON items shape:

- `cpf` (text)
- `formattedCpf` (text)
- `baseNineDigits` (text)

## Domain module

Path: `src/generatorCpfHistory/`

- `domain/types.ts`
  - `GeneratorCpfHistoryRecord`
  - `CreateGeneratorCpfHistoryInput`
  - `UpdateGeneratorCpfHistoryInput`
  - `GeneratorCpfHistoryListParams`
  - `PaginatedGeneratorCpfHistory`
  - `GeneratorCpfHistoryRepository`
- `application/generator-cpf-history.service.ts`
  - CRUD and list orchestration
- `infrastructure/drizzle-generator-cpf-history.repository.ts`
  - Drizzle CRUD and pagination implementation
- `index.ts`
  - exports and service factory

## API routes

1. `app/api/generator-cpf-history/route.ts`

- `POST`: create snapshot from generation payload
- `GET`: list paginated snapshots using `page`, `pageSize`

2. `app/api/generator-cpf-history/[id]/route.ts`

- `GET`: fetch by id
- `PUT`: update by id
- `DELETE`: delete by id

## Validation and behavior

- `partialCpf` is required for create.
- `records` must be an array (empty array is allowed).
- `resultCount` derived from records length.
- Pagination params normalized to positive integers.

## Build and validation

- `pnpm db:generate`
- `pnpm db:push`
- `npm run lint`
- `npm run build`

## Implementation Traceability

1. Schema

- `src/database/schema.ts`

2. Module

- `src/generatorCpfHistory/domain/types.ts`
- `src/generatorCpfHistory/application/generator-cpf-history.service.ts`
- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`
- `src/generatorCpfHistory/index.ts`

3. API

- `app/api/generator-cpf-history/route.ts`
- `app/api/generator-cpf-history/[id]/route.ts`

# Technical Specification - generatorCpf History with Normalized CPF Records

## Overview

Replace JSON-only persistence of generated CPF lists with a relational child table linked to snapshot summaries, and add on-demand details rendering in History tab.

## Data model

1. Table: `generator_cpf_history` (summary)

- `id` (uuid, pk)
- `partial_cpf` (text, not null)
- `state_region_digit` (text, nullable)
- `result_count` (int, not null)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

2. Table: `generator_cpf_history_records` (child rows)

- `id` (uuid, pk)
- `history_id` (uuid, not null, fk -> `generator_cpf_history.id`)
- `cpf` (text, not null)
- `formatted_cpf` (text, not null)
- `base_nine_digits` (text, not null)
- `created_at` (timestamptz)

Constraint behavior:

- FK with `ON DELETE CASCADE`.

## Repository behavior

File: `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`

- `create`:
  - insert snapshot summary,
  - insert all generated CPF child rows,
  - return assembled aggregate.
- `getById`:
  - load snapshot summary,
  - load child rows by `history_id`,
  - map to `resultRecords`.
- `list`:
  - load summary only for pagination.
- `update`:
  - update summary fields,
  - when records payload is provided, replace child rows transactionally.
- `delete`:
  - delete snapshot; child rows removed by cascade.

## API behavior

Routes remain:

- `GET/POST /api/generator-cpf-history`
- `GET/PUT/DELETE /api/generator-cpf-history/[id]`

Behavior changes:

- List endpoint keeps summary semantics for History grid.
- Detail endpoint returns selected snapshot with persisted CPF list from child table.

## UI behavior

File: `src/components/generator-cpf/generator-cpf-history-table.tsx`

- Add row action button `Visualizar CPFs`.
- Action emits selected snapshot id to parent.

File: `src/components/generator-cpf/generator-cpf-client.tsx`

- Add detail-loading state for selected snapshot.
- Call `GET /api/generator-cpf-history/[id]` when user clicks row action.
- Render selected snapshot CPF list using results table component.

## Validation and migration

- Generate migration for schema updates and FK.
- Apply schema updates.
- Validate with:
  - `pnpm db:generate`
  - `pnpm db:push`
  - `npm run lint`
  - `npm run build`

## Implementation Traceability

1. Schema

- `src/database/schema.ts`

2. Repository and contracts

- `src/generatorCpfHistory/domain/types.ts`
- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`

3. API

- `app/api/generator-cpf-history/route.ts`
- `app/api/generator-cpf-history/[id]/route.ts`

4. UI

- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-history-table.tsx`

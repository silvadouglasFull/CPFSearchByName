# Technical Specification - FK from generator_cpf_history_records to hubdo_cpf_lookups

## Overview

Implement an optional FK in `generator_cpf_history_records` so each persisted generated CPF can be linked to a HubDo lookup record and expose explicit verification state.

## Schema changes

### Table: `generator_cpf_history_records`

Add column:

- `hubdo_lookup_id uuid null`

Add FK:

- `hubdo_lookup_id -> hubdo_cpf_lookups.id`
- `ON DELETE SET NULL`

Recommended index:

- `generator_cpf_history_records_hubdo_lookup_id_idx` on `hubdo_lookup_id`

## Drizzle schema update

File: `src/database/schema.ts`

Expected shape (conceptual):

- import `hubdoCpfLookups` table declaration already in same file
- add `hubdoLookupId` field in `generatorCpfHistoryRecords`
- reference `hubdoCpfLookups.id` with `onDelete: 'set null'`
- include index in table callback if query volume justifies it

## Migration strategy

1. Create migration to alter table:

- add nullable column `hubdo_lookup_id`
- create FK constraint with `ON DELETE SET NULL`
- create index on `hubdo_lookup_id`

2. Existing rows:

- remain with `hubdo_lookup_id = null` (no hard backfill required for rollout)

3. Optional backfill phase (non-blocking):

- match by normalized CPF and link to latest eligible lookup per deterministic rule
- run as script or background job

## Data-access behavior

Repository/service updates (if required by consuming features):

- expose `hubdoLookupId` in history record model
- expose computed flag `alreadyVerified = hubdoLookupId !== null`
- allow relinking operation after successful HubDo lookup execution

Recommended relink policy:

- on successful lookup completion, update related history record(s) to point to the created/reused lookup id
- if many lookups exist, prefer newest successful lookup

## Integrity and lifecycle rules

- History record can exist without lookup link.
- Linked lookup deletion must not cascade delete history record.
- FK clearing on lookup deletion must happen automatically via `SET NULL`.

## API/UI impact

Minimum requirement:

- no breaking changes in existing history endpoints.
- additional field can be added to detail/list responses when needed:
  - `hubdoLookupId`
  - `alreadyVerified`

UI can consume `alreadyVerified` to render status badges in history detail table.

## Validation checklist

- Migration applies successfully in development database.
- Insert history record with null `hubdo_lookup_id` works.
- Insert/update history record with valid `hubdo_lookup_id` works.
- Deleting linked `hubdo_cpf_lookups` row sets FK to null in history record.
- Existing history listing/details remain functional.

## Build and checks

- `pnpm db:generate`
- `pnpm db:push` (or project migration apply command)
- `npm run lint`
- `npm run build`

## Implementation traceability

1. Schema and migrations

- `src/database/schema.ts`
- `drizzle/`

2. History model/repository

- `src/generatorCpfHistory/domain/types.ts`
- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`

3. HubDo integration touchpoints

- `src/hubdoCpf/application/hubdo-cpf-lookup.service.ts`
- `app/api/hubdo-cpf-lookup/bulk/route.ts`

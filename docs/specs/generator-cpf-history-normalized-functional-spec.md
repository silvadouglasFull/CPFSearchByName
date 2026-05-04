# Functional Specification - generatorCpf History with CPF Records by Snapshot

## Objective

Persist generated CPF candidates in a relational child table linked to each history snapshot and allow users to visualize generated CPFs from History tab.

## Scope

- Create normalized schema for generated CPF records with FK to snapshot table.
- Keep snapshot summary metadata in history table.
- Update repository/API behavior to persist and retrieve child records.
- Add `Visualizar CPFs` action in History table rows.

## User journey

1. User generates CPF candidates in Search tab.
2. User clicks `Salvar Resultados`.
3. System saves snapshot summary and child CPF rows linked by FK.
4. User opens History tab and sees snapshot summaries.
5. User clicks `Visualizar CPFs` on a row.
6. System loads snapshot details and displays persisted CPF list.

## Inputs

Save operation:

- `partialCpf`
- `stateRegionDigit` (nullable)
- `records[]` with generated CPF entries

History detail operation:

- `snapshotId`

## Outputs

History list output:

- snapshot summary rows:
  - partial CPF
  - region digit
  - result count
  - timestamps

History detail output:

- selected snapshot with generated CPF list:
  - cpf
  - formattedCpf
  - baseNineDigits

## Business rules

- Each generated CPF must be associated with exactly one snapshot via FK.
- Deleting snapshot deletes associated CPF rows (`ON DELETE CASCADE`).
- History list is latest-first and supports pagination.
- `Visualizar CPFs` loads persisted records of selected snapshot.

## Non-functional requirements

- Save and update operations must be transactional.
- History detail loading must provide clear loading/error feedback.
- Responsive UI behavior on desktop and mobile.

## Acceptance criteria

- New child schema table exists and references snapshot id by FK.
- Snapshot save persists summary + child CPF rows.
- History table shows action to visualize CPFs.
- Selected snapshot displays persisted CPF list from database.

## Requirement Traceability

1. Schema

- `src/database/schema.ts`

2. Persistence

- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`

3. API routes

- `app/api/generator-cpf-history/route.ts`
- `app/api/generator-cpf-history/[id]/route.ts`

4. History UI

- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-history-table.tsx`

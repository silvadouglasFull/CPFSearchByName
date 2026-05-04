# Functional Specification - generatorCpf History Persistence

## Objective

Persist generated CPF snapshots from generatorCpf flow to support historical review and reuse.

## Scope

- Store generated CPF list with GeneratedCpfRecord fields.
- Store state region digit used in generation.
- Provide CRUD through service/repository and API.
- Provide paginated listing of saved generation snapshots.

## Inputs

For create operation:

- `partialCpf` used for generation.
- `stateRegionDigit` used for generation (nullable when generation has no state filter).
- `records` containing generated CPF items.

Each record item must contain:

- `cpf`
- `formattedCpf`
- `baseNineDigits`

## Outputs

Persisted history item containing:

- generation input metadata,
- generated list snapshot,
- result count,
- timestamps.

Paginated list response containing:

- items,
- page metadata.

## User journey

1. User runs generatorCpf flow.
2. System persists generated snapshot with the state region digit context.
3. User requests history listing.
4. System returns paginated historical snapshots.
5. User can read, update, or delete entries by id.

## Business rules

- Persisted snapshot must include all GeneratedCpfRecord fields.
- `stateRegionDigit` must be persisted exactly as used in generation.
- Result count equals length of generated records list.
- History listing is ordered by latest first.

## Non-functional requirements

- Pagination defaults and bounds must be safe and deterministic.
- Friendly error messages for invalid payloads and missing resources.

## Acceptance criteria

- New schema persists generated list and state digit.
- Service and repository expose CRUD and paginated list.
- API routes support create/list and CRUD by id.
- Stored result items preserve `cpf`, `formattedCpf`, and `baseNineDigits` fields.

## Requirement Traceability

1. Schema

- `src/database/schema.ts`

2. Domain and business layer

- `src/generatorCpfHistory/domain/types.ts`
- `src/generatorCpfHistory/application/generator-cpf-history.service.ts`

3. Persistence layer

- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`

4. API

- `app/api/generator-cpf-history/route.ts`
- `app/api/generator-cpf-history/[id]/route.ts`

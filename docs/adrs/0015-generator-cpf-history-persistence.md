# ADR 0015 - generatorCpf History Persistence

## Status

Accepted

## Context

The generatorCpf flow currently produces CPF candidates in memory (and optionally JSON output files), but it does not persist generation snapshots in the application database.

A new requirement introduces persistence for generated CPF history, including:

- list of generated CPF records,
- fields from GeneratedCpfRecord,
- state region digit used during generation.

## Decision

1. Persistence model

- A new table `generator_cpf_history` will store generation snapshots.
- Each row stores:
  - input metadata (partial CPF and state region digit),
  - generated result list as JSON,
  - result count,
  - timestamps.

2. Generated record payload

- Persisted result items must include all fields from GeneratedCpfRecord:
  - `cpf`
  - `formattedCpf`
  - `baseNineDigits`
- Persisted snapshot must include `stateRegionDigit` used in generation.

3. Architecture pattern

- Repository pattern for data access.
- Service pattern for orchestration and business operations.
- Drizzle ORM as persistence implementation.

4. API scope

- Introduce history endpoints for create/list and CRUD by id.
- Listing must support pagination.

## Consequences

- CPF generation runs become auditable and reusable.
- Generated snapshots can be consumed by future UI history tabs and reporting.
- Storage size growth is expected due to persisted result lists.

## Related ADRs

- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0008 - generator-cpf Module Reuse as Next.js Page with Sidebar Link
- ADR 0011 - User Settings Persistence with PostgreSQL, Docker, and Drizzle ORM
- ADR 0012 - Global get-cpfs-by-name Settings Persistence
- ADR 0014 - filter-by-cpf Search History Persistence and UI Tabs

## Traceability

1. Schema

- `src/database/schema.ts`

2. Domain/application/infrastructure

- `src/generatorCpfHistory/domain/types.ts`
- `src/generatorCpfHistory/application/generator-cpf-history.service.ts`
- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`
- `src/generatorCpfHistory/index.ts`

3. API

- `app/api/generator-cpf-history/route.ts`
- `app/api/generator-cpf-history/[id]/route.ts`

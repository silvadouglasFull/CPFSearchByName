# ADR 0011 - User Settings Persistence with PostgreSQL, Docker, and Drizzle ORM

## Status

Accepted

## Context

Application collection parameters (e.g., total pages, throttle delay, timeouts) are currently hardcoded as constants in `src/getCpfsByName/domain/constants.ts`.
There is a requirement to:

- persist these settings per user in a relational database,
- allow each user to have independent configuration values,
- isolate database access and business logic through service and repository patterns.

Additionally, other running containers on the host already occupy common ports:

- port 5432 is in use by `lead-mais-db-1` (TimescaleDB).

## Decision

1. Database infrastructure

- PostgreSQL 16 runs in a dedicated Docker container named `verifydocs-db-1`.
- Host port **5433** is used to avoid conflict with existing containers on port 5432.
- Container is defined in `docker-compose.yml` at the project root.
- All database credentials are stored exclusively in `.env` (never committed).
- `.env.example` is committed as a safe credential template.

2. ORM and schema management

- Drizzle ORM is used for type-safe database access.
- `drizzle-orm` and `postgres` (postgres.js) are runtime dependencies.
- `drizzle-kit` is a dev dependency for schema generation and migration.
- Schema definition lives in `src/database/schema.ts`.
- Migration files are generated via `drizzle-kit generate` and applied via `drizzle-kit migrate`.
- `drizzle.config.ts` at the project root controls drizzle-kit behaviour.

3. Architecture patterns

- Repository pattern: `UserSettingsRepository` interface in the domain layer; `DrizzleUserSettingsRepository` in the infrastructure layer.
- Service pattern: `UserSettingsService` in the application layer handles all business rules.
- Domain constants serve as default values when no per-user record exists.

4. Configurable settings per user

The following fields are persisted per `userId`:

| Field                     | Default | Maps to constant             |
| ------------------------- | ------- | ---------------------------- |
| `totalPages`              | 6       | `TOTAL_PAGES`                |
| `resultsPerPage`          | 10      | `RESULTS_PER_PAGE`           |
| `throttleDelayMs`         | 1000    | `PAGE_THROTTLE_DELAY_MS`     |
| `pageResponseTimeoutMs`   | 30000   | `PAGE_RESPONSE_TIMEOUT_MS`   |
| `pageNavigationTimeoutMs` | 60000   | `PAGE_NAVIGATION_TIMEOUT_MS` |
| `pageSelectorTimeoutMs`   | 15000   | `PAGE_SELECTOR_TIMEOUT_MS`   |

5. Integration with existing routes

- `app/api/get-cpfs-by-name/route.ts` accepts an optional `userId` query parameter.
- When provided, user settings are loaded from the database and used instead of hardcoded constants.
- When absent, domain constant defaults are used.

## Consequences

- Application settings become configurable per user without code changes.
- Database access is abstracted behind interfaces; the Drizzle implementation can be replaced independently.
- Docker container is isolated from existing infrastructure with a dedicated port and named volume.
- Future user authentication integration only requires wiring the authenticated user ID to existing service calls.

## Related ADRs

- ADR 0004 - Mandatory TypeScript Engineering Standard
- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0009 - get-cpfs-by-name Module Reuse as Next.js Page
- ADR 0010 - get-cpfs-by-name Collection Progress UI

## Traceability

1. Container and environment

- `docker-compose.yml`
- `.env.example`

2. Database layer

- `src/database/schema.ts`
- `src/database/db.ts`
- `drizzle.config.ts`

3. userSettings module

- `src/userSettings/domain/types.ts`
- `src/userSettings/domain/errors.ts`
- `src/userSettings/application/user-settings.service.ts`
- `src/userSettings/infrastructure/drizzle-user-settings.repository.ts`
- `src/userSettings/index.ts`

4. API layer

- `app/api/user-settings/route.ts`
- `app/api/get-cpfs-by-name/route.ts` (updated to consume user settings)

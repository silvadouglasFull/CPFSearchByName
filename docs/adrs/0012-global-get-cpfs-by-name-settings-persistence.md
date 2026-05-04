# ADR 0012 - Global get-cpfs-by-name Settings Persistence

## Status

Accepted

## Context

The `getCpfsByName` module currently keeps operational configuration in hardcoded constants.
The project now requires these settings to be persisted and recovered from PostgreSQL using repository and service patterns.

At this stage, settings are shared globally for all users.
Per-user settings will be introduced in a future refactor.

## Decision

1. Persistence model

- A new singleton table `app_settings` will store global settings used by `getCpfsByName`.
- Only one logical record is used through a fixed key (`singleton_key = 'global'`).

2. ORM and infrastructure

- Drizzle ORM remains the persistence layer.
- The existing PostgreSQL container and `.env` based credentials are reused.

3. Architecture pattern

- Repository: `AppSettingsRepository` domain contract with Drizzle implementation.
- Service: `AppSettingsService` for orchestration and default bootstrapping.

4. Settings scope persisted in database

- `resultsPerPage`
- `totalPages`
- `pageResponseTimeoutMs`
- `pageNavigationTimeoutMs`
- `pageSelectorTimeoutMs`
- `pageThrottleDelayMs`
- `jsonOutputIndentSpaces`
- `fileEncodingUtf8`
- `cliFirstUserArgIndex`
- `firstPageNumber`
- `searchPageUrl`
- `detailsPageUrl`
- `searchApiHostname`
- `searchApiPathname`
- `defaultPageSelector`

5. Runtime integration

- `getCpfsByName` components (CLI, service, repository clients, mapper, writer, and API route) receive settings from `AppSettingsService` instead of relying only on hardcoded constants.
- Constants remain as defaults and fallback values.

## Consequences

- Configuration changes no longer require code edits for these settings.
- The module becomes ready for future migration to user-scoped settings with minimal refactor.
- Existing flows remain backward compatible through defaults if DB access fails.

## Related ADRs

- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0010 - get-cpfs-by-name Collection Progress UI
- ADR 0011 - User Settings Persistence with PostgreSQL, Docker, and Drizzle ORM

## Traceability

1. Persistence and schema

- `src/database/schema.ts`

2. App settings module

- `src/appSettings/domain/types.ts`
- `src/appSettings/application/app-settings.service.ts`
- `src/appSettings/infrastructure/drizzle-app-settings.repository.ts`
- `src/appSettings/index.ts`

3. Runtime integration in getCpfsByName

- `src/getCpfsByName/cli/get-cpfs-by-name.cli.ts`
- `src/getCpfsByName/application/collect-portal-data.service.ts`
- `src/getCpfsByName/application/portal-record-mapper.ts`
- `src/getCpfsByName/infrastructure/json-portal-results.writer.ts`
- `src/getCpfsByName/infrastructure/puppeteer-portal-search.client.ts`
- `app/api/get-cpfs-by-name/route.ts`

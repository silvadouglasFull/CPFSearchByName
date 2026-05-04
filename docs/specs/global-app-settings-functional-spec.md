# Functional Specification - Global App Settings Persistence

## Objective

Persist and recover all operational settings used by `getCpfsByName` from the database, shared globally for all users.

## Scope

- Store the full configuration set currently hardcoded in `src/getCpfsByName/domain/constants.ts`.
- Recover these values at runtime through repository and service layers.
- Apply retrieved settings to CLI flow and API flow.

## Settings to persist

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

## User journey

1. Application starts or receives a collection request.
2. System retrieves global settings from DB via service.
3. If not found, system creates default settings and uses them.
4. Collection executes using recovered settings.

## Business rules

- Settings apply to all users equally in this phase.
- Missing DB row is auto-initialized with default values.
- If settings retrieval fails unexpectedly, module falls back to constant defaults.

## Acceptance criteria

- All listed settings are persisted in DB.
- `getCpfsByName` runtime uses settings recovered from DB.
- Repository and service patterns are implemented and used.
- Constants remain as defaults/fallback only.

## Requirement Traceability

1. App settings persistence

- `src/database/schema.ts`
- `src/appSettings/infrastructure/drizzle-app-settings.repository.ts`

2. App settings service orchestration

- `src/appSettings/application/app-settings.service.ts`

3. Runtime consumption by module

- `src/getCpfsByName/cli/get-cpfs-by-name.cli.ts`
- `src/getCpfsByName/application/collect-portal-data.service.ts`
- `src/getCpfsByName/application/portal-record-mapper.ts`
- `src/getCpfsByName/infrastructure/json-portal-results.writer.ts`
- `src/getCpfsByName/infrastructure/puppeteer-portal-search.client.ts`
- `app/api/get-cpfs-by-name/route.ts`

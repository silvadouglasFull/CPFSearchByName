# Technical Specification - Global App Settings Persistence

## Overview

Implement a singleton global settings model for `getCpfsByName` backed by PostgreSQL + Drizzle, and inject these settings into runtime components through service and repository patterns.

## Data model

Table: `app_settings`

- `id` (uuid, pk)
- `singleton_key` (text, unique, default `global`)
- `results_per_page` (int)
- `total_pages` (int)
- `page_response_timeout_ms` (int)
- `page_navigation_timeout_ms` (int)
- `page_selector_timeout_ms` (int)
- `page_throttle_delay_ms` (int)
- `json_output_indent_spaces` (int)
- `file_encoding_utf8` (text)
- `cli_first_user_arg_index` (int)
- `first_page_number` (int)
- `search_page_url` (text)
- `details_page_url` (text)
- `search_api_hostname` (text)
- `search_api_pathname` (text)
- `default_page_selector` (text)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Patterns

1. Repository

- `AppSettingsRepository` contract:
  - `getGlobal(): Promise<AppSettings | null>`
  - `upsertGlobal(settings: Partial<AppSettingsFields>): Promise<AppSettings>`

2. Service

- `AppSettingsService`:
  - `getSettings()` returns existing settings or creates default row.
  - `updateSettings()` applies partial updates.

## Runtime injection points

- `PuppeteerPortalSearchClient` constructor receives configurable runtime parameters.
- `CollectPortalDataService` constructor receives page loop settings.
- `PortalRecordMapper` receives details base URL.
- `JsonPortalResultsWriter` receives JSON formatting and encoding settings.
- CLI runner loads global settings and passes them to all collaborators.
- SSE API route loads global settings and applies them to the collection flow.

## Defaults and fallback

- Defaults are still defined in domain constants.
- Service bootstrap creates DB row using defaults.
- Runtime fallback to defaults is allowed if DB retrieval fails.

## Build and validation

- `pnpm db:push`
- `npm run lint`
- `npm run build`

## Implementation Traceability

1. Schema

- `src/database/schema.ts`

2. App settings module

- `src/appSettings/domain/types.ts`
- `src/appSettings/application/app-settings.service.ts`
- `src/appSettings/infrastructure/drizzle-app-settings.repository.ts`
- `src/appSettings/index.ts`

3. getCpfsByName runtime integration

- `src/getCpfsByName/cli/get-cpfs-by-name.cli.ts`
- `src/getCpfsByName/application/collect-portal-data.service.ts`
- `src/getCpfsByName/application/portal-record-mapper.ts`
- `src/getCpfsByName/infrastructure/json-portal-results.writer.ts`
- `src/getCpfsByName/infrastructure/puppeteer-portal-search.client.ts`
- `app/api/get-cpfs-by-name/route.ts`

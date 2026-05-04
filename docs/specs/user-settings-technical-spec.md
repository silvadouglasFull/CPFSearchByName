# Technical Specification - User Settings Persistence

## Overview

Introduce a PostgreSQL database via Docker, managed with Drizzle ORM, to persist per-user application settings following service and repository design patterns.

## Infrastructure

### Docker

- File: `docker-compose.yml` (project root)
- Image: `postgres:16-alpine`
- Container name: `verifydocs-db-1`
- Host port: **5433** (avoids conflict with existing port 5432)
- Named volume: `verifydocs-db-data`

### Environment variables (`.env`)

```
DATABASE_URL=postgresql://verifydocs:verifydocs@localhost:5433/verifydocs
```

### Drizzle configuration (`drizzle.config.ts`)

- Schema: `src/database/schema.ts`
- Output dir: `drizzle/`
- Dialect: `postgresql`
- Reads `DATABASE_URL` from environment

### package.json scripts

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio"
```

## Database schema

Table: `user_settings`

| Column                       | Type        | Constraints                   |
| ---------------------------- | ----------- | ----------------------------- |
| `id`                         | uuid        | PK, default gen_random_uuid() |
| `user_id`                    | text        | NOT NULL, UNIQUE              |
| `total_pages`                | integer     | NOT NULL, default 6           |
| `results_per_page`           | integer     | NOT NULL, default 10          |
| `throttle_delay_ms`          | integer     | NOT NULL, default 1000        |
| `page_response_timeout_ms`   | integer     | NOT NULL, default 30000       |
| `page_navigation_timeout_ms` | integer     | NOT NULL, default 60000       |
| `page_selector_timeout_ms`   | integer     | NOT NULL, default 15000       |
| `created_at`                 | timestamptz | NOT NULL, default now()       |
| `updated_at`                 | timestamptz | NOT NULL, default now()       |

## Module structure (`src/userSettings/`)

```
domain/
  types.ts        — UserSettings, UserSettingsFields, UserSettingsRepository interface, DEFAULT_USER_SETTINGS
  errors.ts       — UserNotFoundError (reserved for future use)
application/
  user-settings.service.ts
infrastructure/
  drizzle-user-settings.repository.ts
index.ts
```

## Domain types

- `UserSettings` — full record shape (matches DB row).
- `UserSettingsFields` — subset of configurable fields (excludes id, userId, timestamps).
- `UserSettingsRepository` — interface with `findByUserId` and `upsert`.
- `DEFAULT_USER_SETTINGS` — const object with default values matching domain constants.

## Service layer (`UserSettingsService`)

- `getSettings(userId)` — finds existing record or creates one with defaults via `upsert`.
- `updateSettings(userId, partial)` — upserts only the provided fields.

## Repository layer (`DrizzleUserSettingsRepository`)

- `findByUserId` — SELECT with WHERE `user_id = ?`, limit 1.
- `upsert` — INSERT ... ON CONFLICT (user_id) DO UPDATE with spread of provided fields and `updated_at = now()`.

## Database connection (`src/database/db.ts`)

- Uses `postgres` (postgres.js) driver with global singleton pattern to prevent excessive connections during Next.js hot reload.
- Exported `db` instance wraps the postgres.js client with `drizzle()`.

## API route (`app/api/user-settings/route.ts`)

- `GET`: returns or creates settings for `userId`.
- `PUT`: partially updates settings for `userId`.
- Both return `{ settings: UserSettings }` on success.
- `400` on missing `userId`; `500` on unexpected error.

## Integration with get-cpfs-by-name route

- Route reads optional `userId` query parameter.
- When present: loads settings via `UserSettingsService`, uses `totalPages`, `throttleDelayMs` for loop control.
- When absent: falls back to `TOTAL_PAGES` and `PAGE_THROTTLE_DELAY_MS` from domain constants.

## Build and validation

- `docker compose up -d`
- `pnpm db:push` (applies schema to database)
- `npm run lint`
- `npm run build`

## Implementation Traceability

1. Infrastructure

- `docker-compose.yml`
- `.env.example`
- `drizzle.config.ts`

2. Database layer

- `src/database/schema.ts`
- `src/database/db.ts`

3. userSettings module

- `src/userSettings/domain/types.ts`
- `src/userSettings/domain/errors.ts`
- `src/userSettings/application/user-settings.service.ts`
- `src/userSettings/infrastructure/drizzle-user-settings.repository.ts`
- `src/userSettings/index.ts`

4. API

- `app/api/user-settings/route.ts`
- `app/api/get-cpfs-by-name/route.ts`

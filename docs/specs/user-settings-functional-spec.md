# Functional Specification - User Settings Persistence per User

## Objective

Allow each user to have individual application configuration values persisted in a database, replacing the current approach of hardcoded constants shared across all users.

## Scope

- Persist collection settings per `userId`.
- Expose API endpoints to read and update user settings.
- Integrate user settings into the get-cpfs-by-name collection flow.
- Provide safe defaults when a user has no saved settings.

## User journey

1. User calls GET `/api/user-settings?userId=<id>`.
2. System returns the user's saved settings, or creates and returns defaults if none exist.
3. User calls PUT `/api/user-settings?userId=<id>` with partial or full settings payload.
4. System persists the changes and returns the updated settings.
5. When the user runs a collection via `GET /api/get-cpfs-by-name?userId=<id>&searchName=<name>`, the system uses the user's settings for total pages, throttle, and timeouts.

## Inputs

- GET `/api/user-settings`: `userId` (required query parameter).
- PUT `/api/user-settings`: `userId` (required), request body with any subset of configurable fields.
- GET `/api/get-cpfs-by-name`: `userId` (optional), `searchName` (required).

## Outputs

- Settings response payload:

```json
{
  "settings": {
    "id": "uuid",
    "userId": "string",
    "totalPages": 6,
    "resultsPerPage": 10,
    "throttleDelayMs": 1000,
    "pageResponseTimeoutMs": 30000,
    "pageNavigationTimeoutMs": 60000,
    "pageSelectorTimeoutMs": 15000,
    "createdAt": "ISO8601",
    "updatedAt": "ISO8601"
  }
}
```

## Business rules

- `userId` is mandatory on all settings endpoints.
- A GET request for a userId with no record creates the record with defaults.
- PUT accepts partial updates; only provided fields are overwritten.
- When `userId` is absent from a collection request, domain constant defaults are used.

## Non-functional requirements

- No database credentials in source code; all stored in `.env`.
- Safe defaults ensure backwards compatibility with existing flows that have no userId.

## Acceptance criteria

- GET returns default settings for a new userId.
- PUT persists partial updates without overwriting unspecified fields.
- Collection flow uses `totalPages` and `throttleDelayMs` from user settings when userId is provided.
- Defaults from domain constants are used when userId is absent.

## Requirement Traceability

1. API endpoints

- `app/api/user-settings/route.ts`

2. Service and repository

- `src/userSettings/application/user-settings.service.ts`
- `src/userSettings/infrastructure/drizzle-user-settings.repository.ts`

3. Integration point

- `app/api/get-cpfs-by-name/route.ts`

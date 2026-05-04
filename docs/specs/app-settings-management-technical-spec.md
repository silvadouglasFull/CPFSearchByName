# Technical Specification - App Settings Management Screen

## Overview

Implement a Next.js management screen for global app settings using existing `app-settings` API endpoints and a componentized client form.

## Architecture

1. Page layer

- New route: `app/app-settings/page.tsx`.
- Uses same container layout baseline as existing feature pages.

2. Component layer

- `AppSettingsHero`: contextual title and explanation.
- `AppSettingsClient`: data fetch, form state, validation, submit flow.

3. API layer (existing)

- `GET /api/app-settings` returns current global settings.
- `PUT /api/app-settings` persists partial updates.

## Data flow

1. On mount, client calls `GET /api/app-settings`.
2. API response hydrates local editable form state.
3. On save, client builds payload from form values and sends `PUT`.
4. On success, returned settings replace local state and success message is shown.
5. On failure, API error message is shown via friendly feedback component.

## Form behavior

- Numeric fields parsed to numbers before submit.
- Text fields trimmed before submit where applicable.
- Save button disabled while request is in flight.
- Dirty-state tracking can optionally disable save when unchanged.

## Validation strategy

Client-side validation:

- Integers required for numeric fields.
- Numeric values must be greater than zero for timeout/page-count fields.
- Required text fields must not be empty.

Server-side validation remains API responsibility (future hardening may enforce schema constraints in route/service).

## UI and UX requirements

- Reuse existing UI primitives (`Card`, `Input`, `Button`, `FriendlyMessage`).
- Group fields into logical sections:
  - Pagination
  - Timeouts and throttling
  - Output format
  - Search endpoints/selectors
- Maintain responsive layout and rounded component style.

## Build and validation

- `npm run lint`
- `npm run build`
- Manual checks:
  - initial load success and failure handling,
  - editing and saving subset of fields,
  - persistence reflected after page refresh.

## Implementation Traceability

1. Page

- `app/app-settings/page.tsx`

2. Components

- `src/components/app-settings/app-settings-hero.tsx`
- `src/components/app-settings/app-settings-client.tsx`

3. API contract

- `app/api/app-settings/route.ts`

4. Domain types consumed by UI

- `src/appSettings/domain/types.ts`

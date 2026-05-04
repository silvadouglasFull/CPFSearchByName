# ADR 0013 - App Settings Management Screen

## Status

Accepted

## Context

Global application settings are already persisted in `app_settings` and exposed via API routes.
However, there is no user interface to inspect or edit these values.

This forces settings changes to be performed manually via API calls or direct database operations, which increases operational risk and reduces usability.

## Decision

1. Dedicated management page

- Introduce a dedicated Next.js page to visualize and edit global application settings.
- The page will be delivered inside the existing app shell and follow the current UI baseline (Tailwind + rounded components).

2. Existing API reuse

- The screen will consume existing routes:
  - `GET /api/app-settings` to load persisted settings.
  - `PUT /api/app-settings` to save updates.
- No new persistence schema is required.

3. Componentized UI

- The screen is split into reusable components:
  - page hero/intro,
  - editable form,
  - save feedback states.
- Field labels and descriptions must clarify how each setting affects runtime behavior.

4. Validation and safe update behavior

- Client-side validation prevents empty and invalid numeric values.
- Server responses are surfaced as friendly messages.
- Save action performs partial update via `PUT` and refreshes local state from API response.

## Consequences

- Operators can adjust runtime settings without touching source code or database clients.
- Error-prone manual updates are reduced.
- Configuration lifecycle becomes part of the regular product UI.

## Related ADRs

- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0007 - Home Shell with Responsive Sidebar Navigation
- ADR 0012 - Global get-cpfs-by-name Settings Persistence

## Traceability

1. API contract reuse

- `app/api/app-settings/route.ts`

2. Management page

- `app/app-settings/page.tsx`

3. UI components

- `src/components/app-settings/app-settings-hero.tsx`
- `src/components/app-settings/app-settings-client.tsx`

4. Optional navigation entry

- `src/components/navigation/navigation-links.ts`

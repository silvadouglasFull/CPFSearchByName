# Functional Specification - App Settings Management Screen

## Objective

Provide a web screen where users can view and edit global application settings persisted in `app_settings`.

## Scope

- Render current global settings in an editable form.
- Allow updating settings through the existing API route.
- Show clear success and error feedback for save operations.

## User journey

1. User opens the settings management page.
2. Screen loads current settings from `GET /api/app-settings`.
3. User edits one or more fields.
4. User clicks save.
5. Screen sends `PUT /api/app-settings` with updated values.
6. System confirms success and shows persisted values.

## Inputs

Editable settings fields:

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

## Outputs

- Current settings prefilled in form controls.
- Save success message when update completes.
- Validation or API error messages when save fails.

## Business rules

- Management screen edits global settings (shared by all users in this phase).
- Numeric fields accept only valid numeric values.
- Text fields required by runtime cannot be empty.
- Save operation uses API response as source of truth for updated local state.

## Non-functional requirements

- Responsive layout for desktop and mobile.
- Accessible labels for all form controls.
- Consistent visual language with existing UI components.

## Acceptance criteria

- Screen loads and displays persisted settings from DB through API.
- User can edit and save all listed fields.
- Success and error states are visible and user-friendly.
- Updated values persist and are shown after save.

## Requirement Traceability

1. API integration

- `app/api/app-settings/route.ts`

2. Page entrypoint

- `app/app-settings/page.tsx`

3. Form orchestration and feedback

- `src/components/app-settings/app-settings-client.tsx`

4. Intro/description component

- `src/components/app-settings/app-settings-hero.tsx`

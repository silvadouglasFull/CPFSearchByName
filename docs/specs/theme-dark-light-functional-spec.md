# Functional Specification - Dark and Light Theme Support

## Objective

Enable users to switch between light and dark visual themes, with an additional system-following mode, in order to improve readability, comfort, and usability during CPF investigation workflows.

## Scope

- Add global theme support for `light`, `dark`, and `system`.
- Provide a visible and reusable theme switcher in the app shell.
- Apply theme consistently across home, feature pages, shared components, and feedback states.
- Persist user preference across sessions.

## Out of scope

- User-account server-side theme persistence in this first phase.
- Per-page theme overrides.
- Full visual redesign unrelated to theme adaptation.

## User journey

1. User opens the application.
2. System loads with previously selected theme, or follows system preference when no explicit choice exists.
3. User opens the theme control in the navigation shell.
4. User selects `Light`, `Dark`, or `System`.
5. Theme updates immediately across the current page.
6. Preference is remembered for the next visit.

## Inputs

- Theme selection action from UI control:
  - `light`
  - `dark`
  - `system`

## Outputs

- Application rendered in the selected effective theme.
- Persisted preference in browser storage.
- Visual consistency in major components (navigation, cards, tables, forms, badges, status messages).

## Business rules

1. Theme options

- The application must expose exactly three theme options: `light`, `dark`, and `system`.

2. Effective theme resolution

- If user preference is `light`, effective theme is light.
- If user preference is `dark`, effective theme is dark.
- If user preference is `system`, effective theme follows OS preference.

3. Persistence

- Explicit user choice must persist across sessions in browser storage.

4. Global behavior

- Theme must be applied globally, not per-page.
- Theme change must reflect immediately without full page reload.

5. Accessibility

- All theme states must preserve readable contrast for core text, surfaces, interactive controls, and status states.

## Non-functional requirements

- Responsive behavior remains unchanged from existing shell and page layouts.
- Theme switching latency should feel immediate in the browser.
- Initial page render should minimize flash of incorrect theme.

## Acceptance criteria

1. User can switch between `light`, `dark`, and `system` from a shared UI control.
2. Theme preference persists after refresh and browser restart.
3. In `system` mode, the app follows OS color preference.
4. Home and all current feature pages render correctly in both light and dark modes.
5. Shared components (forms, tables, cards, messages, navigation) remain readable and visually consistent in both themes.
6. Theme logic is centralized and reusable, avoiding duplicated page-level logic.

## Requirement traceability (Planned)

1. App shell-level theme control

- `src/components/navigation/app-shell.tsx`
- `src/components/navigation/sidebar.tsx`

2. Theme switcher UI component

- `src/components/navigation/theme-switcher.tsx`

3. Global style tokens

- `app/globals.css`

4. Layout integration

- `app/layout.tsx`

5. Shared state/utilities

- `src/lib/theme/*`

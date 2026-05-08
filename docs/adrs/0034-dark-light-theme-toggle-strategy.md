# ADR 0034: Dark/Light Theme Toggle Strategy for Next.js App Shell

## Status

Proposed

## Date

2026-05-08

## Context

The application currently uses a single visual theme. As the product expands and includes longer investigative workflows, users need a visual mode that improves comfort across different environments and times of day.

The implementation must remain compatible with the existing Next.js App Router architecture, Tailwind CSS usage, and componentized navigation shell.

Tailwind supports dark mode in two main ways:

1. `prefers-color-scheme` media-query-driven behavior (automatic only),
2. selector-driven behavior (class or data-attribute) that allows explicit user toggling.

To support both user choice and system defaults, we need a strategy that can represent:

- light mode,
- dark mode,
- system mode.

## Decision

Adopt a selector-driven dark mode strategy using Tailwind's `dark` variant with a root HTML class toggle and three-way preference handling (`light`, `dark`, `system`).

### Decision details

1. Dark mode activation

- Use a root selector strategy (`html.dark`) to activate `dark:*` utilities.

2. Theme source of truth

- Persist explicit user preference in `localStorage` with values:
  - `light`,
  - `dark`,
  - `system` (or key removal).

3. Initial paint behavior

- Apply the effective theme as early as possible (inline script in document head) to reduce flash of incorrect theme.

4. System preference support

- When preference is `system`, compute effective theme using `window.matchMedia('(prefers-color-scheme: dark)')`.

5. UI integration

- Add a reusable theme switcher control in the shared app shell/navigation area so the choice is globally reachable.

## Options considered

### Option A: `prefers-color-scheme` only (automatic, no user toggle) ❌ Rejected

Pros:

- Minimal implementation effort.

Cons:

- No explicit user control.
- Cannot support stable user override across sessions.

### Option B: Class-based manual toggle without `system` mode ⚠️ Partially rejected

Pros:

- Simple implementation.
- Full manual user control.

Cons:

- No first-class support for OS-level preference.
- Worse UX for users who expect automatic system behavior.

### Option C: Class-based toggle with `light`/`dark`/`system` ✅ Chosen

Pros:

- Supports explicit user choice and system preference.
- Works naturally with Tailwind `dark:*` utilities.
- Allows global theme state in App Router layouts.

Cons:

- Slightly more logic for initial theme resolution.
- Requires anti-FOUC handling at first paint.

## Consequences

### Positive

- Consistent dark mode support across all screens.
- Better accessibility and comfort in low-light contexts.
- User preference persists between sessions.
- Theming logic is centralized and reusable.

### Negative

- Additional bootstrap script and client-side state wiring.
- Need to maintain semantic design tokens for both themes.

### Mitigations

- Keep theme state and DOM update logic in a dedicated reusable module/provider.
- Use CSS variables in `globals.css` to minimize repeated class-level overrides.
- Validate both themes in visual/manual QA before release.

## Implementation constraints

- Keep compatibility with Next.js App Router and existing layout/shell structure.
- Do not introduce theme logic in each page independently.
- Apply theme globally through layout-level integration.

## Validation strategy

- Verify initial paint theme correctness on hard refresh.
- Verify persistence across browser restart.
- Verify `system` mode follows OS changes after page load.
- Verify contrast and readability in both themes for key flows.

## Related references

- Tailwind CSS dark mode documentation: https://tailwindcss.com/docs/dark-mode
- ADR 0005: Next.js infrastructure standard
- Home shell/sidebar specifications in `docs/specs`

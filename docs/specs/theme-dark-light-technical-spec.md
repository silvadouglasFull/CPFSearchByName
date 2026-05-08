# Technical Specification - Dark/Light/System Theme Implementation

## Overview

Implement global theme support (`light`, `dark`, `system`) in the Next.js App Router application using Tailwind dark-mode utilities with a selector-driven strategy.

This specification follows ADR 0034 and Tailwind's recommended manual toggle pattern for selector-based dark mode.

## Technical goals

- Centralize theme resolution and DOM application logic.
- Avoid per-page theme branching.
- Minimize FOUC (flash of incorrect theme) on initial paint.
- Keep implementation compatible with existing Tailwind and shared shell components.

## Architecture

### 1. Theme model

Define:

- `ThemePreference = 'light' | 'dark' | 'system'`
- `EffectiveTheme = 'light' | 'dark'`

Resolution rule:

- `light` -> light
- `dark` -> dark
- `system` -> based on `matchMedia('(prefers-color-scheme: dark)')`

### 2. DOM strategy

- Apply dark mode via root selector (`html.dark`).
- Use Tailwind `dark:*` utilities and/or CSS variables consumed by shared classes.

### 3. Storage strategy

- Persist preference in `localStorage` under a dedicated key (for example `theme`).
- If value is absent, default runtime preference to `system`.

### 4. First-paint bootstrap

- Inject a minimal inline script in layout head to:
  - read stored preference,
  - resolve effective theme,
  - set/remove `dark` class on `document.documentElement` before hydration.

### 5. Runtime synchronization

- Expose a client-side theme provider/hook that:
  - reads current preference,
  - updates `html.dark` when preference changes,
  - writes preference to storage,
  - listens to `prefers-color-scheme` changes when in `system` mode.

## UI integration

### Theme switcher component

- Build a reusable switcher control with three explicit options (`Light`, `Dark`, `System`).
- Mount it in shared navigation/app-shell area.
- Ensure keyboard accessibility and visible focus states.

### Styling adaptation scope

- Update shared components and major page sections to use semantic light/dark tokens.
- Avoid one-off inline hardcoded color patches where a tokenized class is possible.

## Styling strategy

### Preferred approach

- Define/align CSS variables in `app/globals.css` for core semantic roles, for example:
  - page background,
  - foreground text,
  - card background,
  - border color,
  - muted text,
  - status surfaces.

- Map variables for both default and `.dark` roots.
- Keep Tailwind utility usage consistent with existing shadcn/Tailwind patterns.

## Error handling and fallbacks

- If storage contains an invalid value, fallback to `system`.
- If `matchMedia` is unavailable, fallback to `light`.
- Theme switcher must not block app rendering if initialization fails.

## Performance considerations

- Keep inline bootstrap script minimal and synchronous.
- Avoid expensive recalculation on every render.
- Restrict DOM mutation to root class toggling and state updates.

## Security and privacy

- Theme preference is non-sensitive and stored locally.
- Do not send theme preference to external providers in this phase.

## Testing and validation plan

1. Unit-level (if test harness exists)

- Theme resolution function behavior for all preference values.
- Invalid storage value fallback.

2. Integration/manual

- Hard refresh preserves selected theme.
- Browser restart preserves selected theme.
- `system` mode tracks OS theme changes while app is open.
- No visible theme flicker on first render under common conditions.
- Core screens remain legible and consistent in both themes.

3. Regression checks

- `npm run lint`
- `npm run build`

## Implementation traceability (Planned)

1. Theme bootstrap and layout integration

- `app/layout.tsx`

2. Global styles and tokens

- `app/globals.css`

3. Theme provider and utilities

- `src/lib/theme/theme-provider.tsx`
- `src/lib/theme/theme-storage.ts`
- `src/lib/theme/theme-resolver.ts`

4. Theme switcher UI

- `src/components/navigation/theme-switcher.tsx`
- `src/components/navigation/app-shell.tsx`

## Rollout plan

1. Add foundational theme model, bootstrap script, and provider.
2. Integrate switcher into shared shell.
3. Adapt shared styles/components to semantic tokens.
4. Validate all main feature routes in both themes.
5. Ship behind normal release flow.

## References

- Tailwind CSS Dark Mode: https://tailwindcss.com/docs/dark-mode
- ADR 0034: Dark/Light Theme Toggle Strategy

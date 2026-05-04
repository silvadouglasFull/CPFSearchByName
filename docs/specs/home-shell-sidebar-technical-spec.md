# Technical Specification - Home Shell and Responsive Sidebar Navigation

## Overview

Implement a reusable navigation shell in Next.js App Router, centered on the home page and featuring a responsive sidebar with hamburger interaction for small screens.

## Target architecture

1. Shell layer

- A shared shell wrapper composes:
  - sidebar navigation,
  - mobile trigger,
  - page content slot.

2. Navigation layer

- Route links are defined in a central configuration file.
- Sidebar renders menu items from the configuration.

3. Responsive behavior

- Small screens: sidebar controlled by local open/close state.
- Large screens: sidebar fixed/visible with no toggle dependency.

4. UI stack

- Tailwind CSS utilities for layout and breakpoints.
- shadcn/ui primitives where useful (buttons, separators, sheets/drawers if adopted).

## Proposed component boundaries

1. `AppShell`

- Responsibility: layout composition and sidebar state orchestration.

2. `Sidebar`

- Responsibility: render page links and navigation grouping.

3. `HamburgerTrigger`

- Responsibility: open/close interaction on small screens.

4. `NavigationLinks` config

- Responsibility: source of truth for route labels, hrefs, and optional icons.

## State and interaction model

- `isSidebarOpen` state managed in shell on small screens.
- Trigger toggles state.
- Selecting a link closes sidebar on small screens.
- Route highlighting may use pathname matching.

## Accessibility and UX requirements

- Trigger exposes `aria-label` and `aria-expanded`.
- Focus states preserved for all interactive controls.
- Sufficient contrast and pointer target sizes on mobile.

## Integration requirements

- Home page must render inside shell.
- Existing pages should adopt shell without duplicating navigation code.
- New pages must update centralized navigation config.

## Build and validation

- `npm run lint`
- `npm run build`
- Manual viewport validation:
  - mobile open/close behavior,
  - desktop persistent sidebar,
  - link navigation correctness.

## Planned Implementation Traceability

1. Shared shell and navigation components

- `src/components/navigation/app-shell.tsx`
- `src/components/navigation/sidebar.tsx`
- `src/components/navigation/hamburger-trigger.tsx`

2. Navigation route registry

- `src/components/navigation/navigation-links.ts`

3. App integration points

- `app/layout.tsx`
- `app/page.tsx`

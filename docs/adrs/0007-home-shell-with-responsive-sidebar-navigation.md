# ADR 0007 - Home Shell with Responsive Sidebar Navigation

## Status

Accepted

## Context

The application now has multiple pages and feature flows exposed through Next.js.
Without a shared navigation shell, page discovery and user orientation become inconsistent, especially on mobile devices.

The project requires:

- a home page as entry point,
- a reusable sidebar with links to all application pages,
- responsive behavior with hamburger toggle on small screens.

## Decision

The application will adopt a navigation shell architecture with these rules:

1. Home as navigation entrypoint

- The home page is the default route and must render inside a shared shell.

2. Shared sidebar navigation

- A reusable sidebar component will hold links to all application pages.
- Link definitions must be centralized in a reusable configuration object.

3. Mobile-first responsive behavior

- On small screens, the sidebar is hidden by default.
- A hamburger button controls open/close state.
- Sidebar state must close automatically after selecting a navigation link on small screens.

4. Reuse and composability

- Sidebar, trigger button, nav list, and shell wrapper must be split into reusable components.
- Styling will follow Tailwind CSS + shadcn/ui baseline with rounded visual language.

5. Accessibility baseline

- Hamburger button must expose accessible label and state.
- Keyboard navigation and focus visibility are mandatory for sidebar links.

## Consequences

- Consistent cross-page navigation on desktop and mobile.
- Improved UX through a single reusable app shell.
- Lower maintenance cost due to centralized route-link configuration.
- New pages must be added to the navigation configuration to remain discoverable.

## Related ADRs

- ADR 0004 - Mandatory TypeScript Engineering Standard (Next.js Context)
- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0006 - filter-by-cpf Refactor to Next.js BFF and Componentized UI

## Planned Traceability

1. Shell layout composition

- `app/layout.tsx`
- `app/page.tsx`

2. Sidebar and mobile toggle components

- `src/components/navigation/app-shell.tsx`
- `src/components/navigation/sidebar.tsx`
- `src/components/navigation/hamburger-trigger.tsx`

3. Navigation link configuration

- `src/components/navigation/navigation-links.ts`

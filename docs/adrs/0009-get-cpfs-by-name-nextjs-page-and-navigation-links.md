# ADR 0009 - get-cpfs-by-name Module Reuse as Next.js Page with Sidebar and Home Links

## Status

Accepted

## Context

The `getCpfsByName` capability currently exists as reusable application/domain modules with a CLI entrypoint based on Puppeteer collection and JSON persistence.
After ADR 0005 and ADR 0007, new feature delivery must be exposed as Next.js pages inside the shared app shell.

There is a product requirement to:

- reuse the `src/getCpfsByName/**` module in the web application,
- deliver a dedicated page in App Router,
- add navigation discoverability in both sidebar and home.

## Decision

The `getCpfsByName` flow will be exposed in the web application with these rules:

1. New page route in App Router

- A dedicated page will be created at `app/get-cpfs-by-name/page.tsx`.
- The page must follow the same layout container baseline used in `app/filter-by-cpf/page.tsx`.

2. Reuse of existing module logic

- Web flow orchestration must reuse `CollectPortalDataService` and related domain/infrastructure contracts from `src/getCpfsByName/**`.
- Existing validation rules for search input remain centralized and are not duplicated in UI components.

3. BFF endpoint for browser consumption

- A Route Handler will expose the search flow for the page.
- Runtime stays in Node.js and uses dynamic execution for request-time operations.

4. Navigation discoverability in sidebar and home

- A new route entry must be added to centralized navigation links.
- Sidebar and home must both consume this same centralized source of truth so one link update propagates to both places.

## Consequences

- `getCpfsByName` becomes available through the web application without CLI-only dependency.
- Business rules and Puppeteer collection behavior remain centralized in existing module layers.
- Navigation maintenance is simplified through a single route-link registry consumed by sidebar and home.
- The web flow can reuse existing friendly-message UI patterns for loading, success, empty, and error outcomes.

## Related ADRs

- ADR 0004 - Mandatory TypeScript Engineering Standard (Next.js Context)
- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0006 - filter-by-cpf Refactor to Next.js BFF and Componentized UI
- ADR 0007 - Home Shell with Responsive Sidebar Navigation
- ADR 0008 - generator-cpf Module Reuse as Next.js Page with Sidebar Link

## Planned Traceability

1. New page entrypoint with layout parity

- `app/get-cpfs-by-name/page.tsx`
- `app/filter-by-cpf/page.tsx`

2. BFF route for search-by-name collection

- `app/api/get-cpfs-by-name/route.ts`

3. Reuse of existing module logic

- `src/getCpfsByName/application/collect-portal-data.service.ts`
- `src/getCpfsByName/domain/search-name.utils.ts`
- `src/getCpfsByName/infrastructure/puppeteer-portal-search.client.ts`
- `src/getCpfsByName/infrastructure/json-portal-results.writer.ts`

4. Componentized web UI

- `src/components/get-cpfs-by-name/get-cpfs-by-name-hero.tsx`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-client.tsx`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-results-table.tsx`

5. Sidebar and home navigation discoverability

- `src/components/navigation/navigation-links.ts`
- `app/page.tsx`

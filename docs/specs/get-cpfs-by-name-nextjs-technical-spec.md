# Technical Specification - get-cpfs-by-name Next.js Page

## Overview

Implement a Next.js page that exposes CPF collection by person name using the existing `getCpfsByName` module, and integrate discoverability through centralized navigation links consumed by both sidebar and home.

## Target architecture

1. Page layer

- New route: `app/get-cpfs-by-name/page.tsx`.
- Page container/layout baseline aligned with `app/filter-by-cpf/page.tsx`.

2. BFF/API layer

- Route Handler: `app/api/get-cpfs-by-name/route.ts`.
- Runtime: `nodejs`.
- Rendering mode: `force-dynamic`.
- Contract:
  - success: `{ records: PortalRecord[] }`,
  - failure: `{ error: string }`.

3. Module reuse layer

- Reuse `CollectPortalDataService` orchestration and existing domain contracts.
- Use existing validation utility for search-name input.
- Keep existing mapper, search client, and writer implementations as system-of-record behavior.

4. UI composition layer

- Dedicated components under `src/components/get-cpfs-by-name/`:
  - hero section,
  - client orchestration/form,
  - results table.

5. Navigation layer

- Add route metadata in `src/components/navigation/navigation-links.ts`.
- Sidebar and home keep consuming `NAVIGATION_LINKS` so both surfaces are updated by a single config change.

## Request flow

1. User navigates to `/get-cpfs-by-name` from sidebar or home.
2. User submits a `searchName` value.
3. Client sends request to `/api/get-cpfs-by-name`.
4. Route validates input and invokes collection service.
5. Service executes paginated collection and record mapping.
6. Writer persists results to `resultados_portal.json`.
7. API returns normalized JSON payload.
8. UI renders records, counts, or friendly error states.

## Validation and error strategy

- Missing/blank `searchName` maps to `400`.
- Known domain validation errors map to `400`.
- Unexpected collection/runtime failures map to `500` with safe message.
- Page-level collection failures are tolerated per module behavior (logged and continued), with final response based on aggregate output.

## Performance and runtime considerations

- Collection is I/O and browser-automation heavy; API route remains dynamic and server-side only.
- Keep imports scoped to required module parts to avoid pulling CLI-only code into route bundle.
- Preserve existing module throttling and timeout constants.

## Build and validation

- `npm run lint`
- `npm run build`
- Manual verification:
  - new route appears in sidebar,
  - same route appears on home cards,
  - successful collection response renders records,
  - validation and error states render friendly messages.

## Planned Implementation Traceability

1. Page and route entrypoints

- `app/get-cpfs-by-name/page.tsx`
- `app/api/get-cpfs-by-name/route.ts`

2. Module reuse

- `src/getCpfsByName/application/collect-portal-data.service.ts`
- `src/getCpfsByName/domain/search-name.utils.ts`
- `src/getCpfsByName/application/portal-record-mapper.ts`
- `src/getCpfsByName/infrastructure/puppeteer-portal-search.client.ts`
- `src/getCpfsByName/infrastructure/json-portal-results.writer.ts`

3. UI components

- `src/components/get-cpfs-by-name/get-cpfs-by-name-hero.tsx`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-client.tsx`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-results-table.tsx`

4. Navigation discoverability

- `src/components/navigation/navigation-links.ts`
- `app/page.tsx`

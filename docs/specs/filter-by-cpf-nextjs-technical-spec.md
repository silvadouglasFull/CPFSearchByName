# Technical Specification - filter-by-cpf Next.js Refactor

## Overview

This implementation migrates `filter-by-cpf` consumption from CLI-first to Next.js-first, with an App Router endpoint and a componentized frontend.

## Architecture

1. API layer (BFF)

- File: `app/api/filter-by-cpf/route.ts`
- Runtime: `nodejs`
- Rendering mode: `force-dynamic`

2. Reused domain/application modules

- `src/filterByCpf/application/filter-by-cpf.service.ts`
- `src/filterByCpf/infrastructure/json-results.repository.ts`

3. Frontend layer

- Page entry: `app/page.tsx`
- UI components:
  - `src/components/filter-by-cpf/filter-cpf-hero.tsx`
  - `src/components/filter-by-cpf/filter-cpf-client.tsx`
  - `src/components/filter-by-cpf/filter-cpf-results-table.tsx`

4. Shared feedback component

- `src/components/shared/friendly-message.tsx`
- Variants: `info`, `success`, `warning`, `error`

5. UI foundation

- Tailwind CSS v4
- shadcn/ui generated primitives (`card`, `input`, `button`, `table`, `badge`, `alert`)

## Request flow

1. Client form submit in `FilterCpfClient`.
2. `fetch` request to `/api/filter-by-cpf`.
3. Route handler validates query and instantiates repository/service.
4. Service executes filtering against JSON source.
5. API returns normalized JSON response.
6. Client renders table or shared friendly message.

## Error handling strategy

- Missing query parameter: explicit `400` response.
- Missing source file: explicit `404` response with actionable message.
- Internal failures: `500` response with safe message.

## Responsiveness and UX

- Form layout uses responsive grid (`sm` breakpoint split between input and button).
- Results table container supports vertical scrolling for smaller viewports.
- Visual language uses rounded containers and consistent spacing.

## Reuse strategy

- No domain rule duplication in Route Handler.
- Shared `FriendlyMessage` component centralizes user-feedback presentation.
- `PortalResultRecord` adaptation is handled in table component helper functions for compatibility with legacy and normalized field names.

## Build and validation

- `npm run lint`
- `npm run build`

## Future evolution

- Reuse `FriendlyMessage` across generation and pipeline pages.
- Introduce additional BFF endpoints for other legacy flows using the same pattern.

## Implementation Traceability

1. API/BFF layer

- `app/api/filter-by-cpf/route.ts`

2. Domain/application reuse

- `src/filterByCpf/application/filter-by-cpf.service.ts`
- `src/filterByCpf/infrastructure/json-results.repository.ts`

3. Frontend composition

- `app/page.tsx`
- `src/components/filter-by-cpf/filter-cpf-hero.tsx`
- `src/components/filter-by-cpf/filter-cpf-client.tsx`
- `src/components/filter-by-cpf/filter-cpf-results-table.tsx`

4. Shared feedback pattern

- `src/components/shared/friendly-message.tsx`

5. UI primitive dependencies (shadcn/ui)

- `src/components/ui/alert.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/badge.tsx`

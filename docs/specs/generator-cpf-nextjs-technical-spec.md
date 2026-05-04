# Technical Specification - generator-cpf Next.js Page

## Overview

Implement a Next.js page that consumes CPF generation capabilities by reusing the existing `generatorCpf` module, while preserving the same layout/design baseline used by the filter-by-cpf page and adding navigation discoverability through sidebar links.

## Target architecture

1. Page layer

- New route: `app/generator-cpf/page.tsx`.
- Page container/layout baseline aligned with `app/filter-by-cpf/page.tsx`.

2. Domain/application reuse layer

- Reuse existing exports in `src/generatorCpf/index.ts`.
- Core flow reuses:
  - `GenerateCpfCandidatesService`,
  - formatting/normalization helpers,
  - existing domain validation errors.

3. UI composition layer

- Dedicated components under `src/components/generator-cpf/`:
  - hero section,
  - client/form orchestration,
  - results rendering.

4. Navigation layer

- Add generator route metadata in `src/components/navigation/navigation-links.ts`.
- Sidebar automatically renders the new link via centralized link registry.

## Request and interaction flow

1. User navigates to `/generator-cpf` from sidebar.
2. User submits `partialCpf` and optional `regionDigit`.
3. Page-level client orchestration triggers generation flow.
4. Generation flow reuses module functions from `src/generatorCpf/index.ts`.
5. UI renders records table/list and summary feedback.

## Validation and error handling strategy

- Invalid `partialCpf` uses existing module validation (`1..9` digits).
- Invalid `regionDigit` uses existing module validation (single digit).
- Unexpected failures are mapped to friendly UI error messaging.

## Layout and design parity requirement

- The root page container must match the same spacing and width baseline used by `app/filter-by-cpf/page.tsx`.
- Component visual style must preserve rounded cards/controls and responsive spacing already used in the application.

## Reuse strategy

- No duplication of generation formulas or validation rules in UI.
- New page composes existing module capabilities through exported module surface.
- Navigation remains centralized in one links registry file.

## Build and validation

- `npm run lint`
- `npm run build`
- Manual checks:
  - generator page route availability,
  - sidebar link visibility on desktop/mobile,
  - responsive layout parity with filter page,
  - correct validation and output rendering.

## Planned Implementation Traceability

1. New page route and layout parity

- `app/generator-cpf/page.tsx`
- `app/filter-by-cpf/page.tsx`

2. Module reuse contracts

- `src/generatorCpf/index.ts`
- `src/generatorCpf/application/generate-cpf-candidates.service.ts`
- `src/generatorCpf/domain/cpf-format.utils.ts`
- `src/generatorCpf/domain/errors.ts`

3. Generator-specific UI components

- `src/components/generator-cpf/generator-cpf-hero.tsx`
- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`

4. Sidebar integration

- `src/components/navigation/navigation-links.ts`

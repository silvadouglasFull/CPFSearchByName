# ADR 0006 - filter-by-cpf Refactor to Next.js BFF and Componentized UI

## Status

Accepted

## Context

The `filter-by-cpf` capability originally ran through a Node.js CLI workflow.
After the infrastructure decision in ADR 0005, new feature delivery must be exposed first through Next.js App Router.

The project also required a responsive and reusable UI layer based on Tailwind CSS and shadcn/ui components, with user-friendly feedback messages.

## Decision

The `filter-by-cpf` flow is refactored with the following architecture:

1. Backend-for-frontend endpoint in App Router

- A dedicated Route Handler is exposed at `app/api/filter-by-cpf/route.ts`.
- The endpoint keeps runtime in Node.js and executes dynamically.

2. Reuse of existing domain/application logic

- The route handler reuses the existing `FilterByCpfService` and `JsonResultsRepository` modules.
- Business logic remains in `src/filterByCpf/**` and is not duplicated in UI or route layer.

3. Componentized, responsive UI

- The page is split into reusable components:
  - hero section,
  - filter form/client orchestration,
  - results table.
- UI is implemented with Tailwind CSS and shadcn/ui components with rounded visual language.

4. Reusable user-feedback component

- A shared `FriendlyMessage` component is introduced in `src/components/shared/friendly-message.tsx`.
- It supports `info`, `success`, `warning`, and `error` variants, and is used by the filter page.

5. Friendly API error contract

- Missing `partialCpf` returns HTTP `400`.
- Missing data source file returns HTTP `404` with guidance message.
- Unhandled failures return HTTP `500`.

## Consequences

- `filter-by-cpf` is now consumable by browser clients and future UI flows without CLI coupling.
- Reuse is improved through a shared friendly-message component and isolated domain modules.
- API and UI now follow the Next.js infrastructure baseline from ADR 0005.
- Legacy CLI path can remain for compatibility, but web/API is the primary delivery path.

## Related ADRs

- ADR 0004 - Mandatory TypeScript Engineering Standard (Next.js Context)
- ADR 0005 - Next.js 16 Infrastructure Standard

## Traceability Matrix

1. BFF Route Handler decision

- `app/api/filter-by-cpf/route.ts`

2. Reuse of existing domain/application modules

- `src/filterByCpf/application/filter-by-cpf.service.ts`
- `src/filterByCpf/infrastructure/json-results.repository.ts`

3. Componentized responsive UI

- `app/page.tsx`
- `src/components/filter-by-cpf/filter-cpf-hero.tsx`
- `src/components/filter-by-cpf/filter-cpf-client.tsx`
- `src/components/filter-by-cpf/filter-cpf-results-table.tsx`

4. Reusable user feedback component

- `src/components/shared/friendly-message.tsx`

5. UI primitives and visual consistency

- `src/components/ui/alert.tsx`
- `src/components/ui/card.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/button.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/badge.tsx`

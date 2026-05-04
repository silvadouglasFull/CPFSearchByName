# ADR 0008 - generator-cpf Module Reuse as Next.js Page with Sidebar Link

## Status

Accepted

## Context

The `generatorCpf` capability currently exists as reusable application/domain modules with a CLI entrypoint.
After ADR 0005 and ADR 0007, new feature delivery must be exposed as Next.js pages inside the shared app shell.

There is a product requirement to:

- reuse existing functions from `src/generatorCpf/**` without duplicating business rules,
- deliver a dedicated page in the application,
- follow the same page layout/design pattern used by `app/filter-by-cpf/page.tsx`,
- add the new page to sidebar navigation.

## Decision

The `generatorCpf` flow will be exposed in the web application with these rules:

1. New page route in App Router

- A dedicated page will be created at `app/generator-cpf/page.tsx`.
- The page will follow the same layout container pattern used in `app/filter-by-cpf/page.tsx`.

2. Reuse of existing module functions

- Web flow orchestration must reuse exported functions from `src/generatorCpf/index.ts`.
- Core generation rules remain in existing application/domain modules and are not reimplemented in UI components.

3. Componentized UI aligned with current design

- The new page will be split into reusable components (hero, form/client orchestration, and results section).
- UI must follow Tailwind CSS + shadcn/ui baseline and rounded visual language already adopted.

4. Sidebar discoverability

- A new navigation link for the generator page must be added to the centralized sidebar links configuration.
- The link must be available in desktop and mobile navigation behaviors already defined by ADR 0007.

## Consequences

- `generatorCpf` becomes accessible through the web app without CLI-only dependency.
- Existing business rules stay centralized and reusable.
- UX remains consistent with existing pages by reusing the same layout/design baseline.
- Navigation remains maintainable through centralized route-link configuration.

## Related ADRs

- ADR 0004 - Mandatory TypeScript Engineering Standard (Next.js Context)
- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0006 - filter-by-cpf Refactor to Next.js BFF and Componentized UI
- ADR 0007 - Home Shell with Responsive Sidebar Navigation

## Planned Traceability

1. New generator page entrypoint with same layout baseline

- `app/generator-cpf/page.tsx`
- `app/filter-by-cpf/page.tsx`

2. Reuse of existing generator module

- `src/generatorCpf/index.ts`
- `src/generatorCpf/application/generate-cpf-candidates.service.ts`
- `src/generatorCpf/domain/cpf-format.utils.ts`

3. Componentized page implementation

- `src/components/generator-cpf/generator-cpf-hero.tsx`
- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`

4. Sidebar link integration

- `src/components/navigation/navigation-links.ts`

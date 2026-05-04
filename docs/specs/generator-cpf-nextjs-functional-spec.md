# Functional Specification - generator-cpf Next.js Page

## Objective

Expose CPF candidate generation as a web page in the Next.js application, reusing existing `generatorCpf` module functions and preserving the current visual/layout baseline used by the filter page.

## Scope

- Provide a dedicated application page for CPF generation.
- Reuse existing generation logic from `src/generatorCpf/**`.
- Follow the same layout/design pattern used by `app/filter-by-cpf/page.tsx`.
- Add a navigation link in the sidebar for page discoverability.

## User journey

1. User accesses the application.
2. User opens the generator page from the sidebar link.
3. User informs a partial CPF (1 to 9 digits) and optional region digit.
4. User submits generation.
5. System generates valid CPF candidates using existing module rules.
6. System displays generated candidates in the page.

## Inputs

- `partialCpf` (required): 1 to 9 digits.
- `regionDigit` (optional): a single digit from 0 to 9.

## Outputs

- List of generated records with:
  - complete CPF,
  - formatted CPF,
  - base 9 digits.
- Total number of generated records.
- Friendly messages for validation, empty, and error states.

## Business and validation rules

- `partialCpf` is mandatory and must contain 1 to 9 digits.
- `regionDigit`, when informed, must contain exactly 1 digit.
- Generation and validation rules must reuse `generatorCpf` domain/application logic.
- Business logic must not be duplicated in page-level UI components.

## UX and navigation requirements

- The page must use the same layout container baseline as `app/filter-by-cpf/page.tsx`.
- Visual language must remain consistent with existing rounded Tailwind/shadcn style.
- The page must be reachable through a new sidebar link in centralized navigation config.

## Non-functional requirements

- Responsive behavior for mobile and desktop.
- Accessible form controls and actionable feedback.
- Reusable component boundaries for maintainability.

## Acceptance criteria

- A dedicated page exists for CPF generation in App Router.
- The page reuses existing module functions from `src/generatorCpf/**`.
- Layout/design baseline matches `app/filter-by-cpf/page.tsx` container structure.
- Sidebar includes the new generator page link.
- User can generate candidates from the web page with proper validation feedback.

## Requirement Traceability (Planned)

1. New page and layout baseline consistency

- `app/generator-cpf/page.tsx`
- `app/filter-by-cpf/page.tsx`

2. Reuse of existing generation logic

- `src/generatorCpf/index.ts`
- `src/generatorCpf/application/generate-cpf-candidates.service.ts`
- `src/generatorCpf/domain/cpf-format.utils.ts`

3. Generator UI composition

- `src/components/generator-cpf/generator-cpf-hero.tsx`
- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`

4. Sidebar navigation update

- `src/components/navigation/navigation-links.ts`

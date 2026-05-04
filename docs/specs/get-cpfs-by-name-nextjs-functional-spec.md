# Functional Specification - get-cpfs-by-name Next.js Page

## Objective

Expose portal CPF collection by person name as a web flow in Next.js, reusing existing `getCpfsByName` module logic and ensuring discoverability through both sidebar and home navigation.

## Scope

- Provide a dedicated page for CPF collection by name.
- Reuse `src/getCpfsByName/**` logic instead of duplicating business rules.
- Add a route entry in centralized navigation links.
- Ensure the new route appears in both sidebar and home navigation surfaces.

## User journey

1. User accesses the application.
2. User finds and opens the new page from sidebar or home.
3. User enters a name to search.
4. User submits the search.
5. Frontend calls the dedicated BFF route.
6. System collects records from portal pages through existing module logic.
7. System displays collected CPF records and summary feedback.

## Inputs

- `searchName` (required): person name to query in portal search flow.

## Outputs

- Collected records list with name, CPF, relation, source page, and details link.
- Total records count.
- Friendly messages for validation errors, empty results, and request failures.

## Business and validation rules

- `searchName` is mandatory and cannot be empty.
- Collection logic must preserve existing module behavior:
  - iterate from first to total configured pages,
  - throttle between page requests,
  - continue when an individual page fails and log page error,
  - persist full result set to `resultados_portal.json`.
- UI and route layers must not reimplement core scraping or mapping rules.

## UX and navigation requirements

- The page must follow the same layout container baseline used by `app/filter-by-cpf/page.tsx`.
- Visual language must stay aligned with rounded Tailwind/shadcn style already adopted.
- The new route must be listed in centralized navigation links so it appears in:
  - sidebar menu,
  - home page cards.

## Non-functional requirements

- Responsive behavior for mobile and desktop.
- Accessible form controls and focus-visible interactions.
- Node.js runtime usage for server-side collection operations.

## Acceptance criteria

- A dedicated App Router page exists for `getCpfsByName`.
- Page and BFF route reuse existing module layers from `src/getCpfsByName/**`.
- New route link is visible and functional in both sidebar and home.
- User can run a name-based search and see collected records.
- Validation and failure scenarios present friendly feedback messages.

## Requirement Traceability (Planned)

1. Dedicated page and layout parity

- `app/get-cpfs-by-name/page.tsx`
- `app/filter-by-cpf/page.tsx`

2. BFF route exposure

- `app/api/get-cpfs-by-name/route.ts`

3. Module reuse

- `src/getCpfsByName/application/collect-portal-data.service.ts`
- `src/getCpfsByName/domain/search-name.utils.ts`
- `src/getCpfsByName/infrastructure/puppeteer-portal-search.client.ts`
- `src/getCpfsByName/infrastructure/json-portal-results.writer.ts`

4. UI composition

- `src/components/get-cpfs-by-name/get-cpfs-by-name-hero.tsx`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-client.tsx`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-results-table.tsx`

5. Sidebar and home discoverability

- `src/components/navigation/navigation-links.ts`
- `app/page.tsx`

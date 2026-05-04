# Functional Specification - filter-by-cpf Next.js Refactor

## Objective

Expose the partial CPF filtering capability as a web flow in Next.js, reusing existing domain logic and providing a friendly, responsive user experience.

## Scope

- Provide an HTTP endpoint to filter by partial CPF.
- Provide a responsive page with separated reusable components.
- Display matching records in tabular form.
- Display reusable friendly messages for error and empty states.

## User journey

1. User accesses the home page.
2. User enters a partial CPF (1 to 9 digits).
3. User submits the search.
4. Frontend calls `GET /api/filter-by-cpf?partialCpf=<value>`.
5. System displays one of the outcomes:
   - list of matching records,
   - empty-state friendly message,
   - error-state friendly message.

## Inputs

- `partialCpf` as query parameter in API request.

## Outputs

- API success payload:

```json
{
  "records": []
}
```

- API error payload:

```json
{
  "error": "message"
}
```

- UI output:
  - rounded card-based form,
  - rounded messages,
  - responsive results table.

## Business and validation rules

- `partialCpf` is mandatory.
- Filtering behavior follows existing `filterByCpf` module rules.
- Data source file is `resultados_portal.json`.

## API behavior

- `200`: successful filtering with `records` array.
- `400`: missing `partialCpf`.
- `404`: `resultados_portal.json` not found.
- `500`: unexpected internal error.

## Non-functional requirements

- Responsive layout for small and large screens.
- UI built with Tailwind CSS and shadcn/ui generated components.
- Reusable feedback component for user-facing messages.

## Acceptance criteria

- User can filter records by partial CPF from the web page.
- The page is usable on mobile and desktop.
- Error and empty states use the shared friendly-message component.
- Route handler reuses existing domain/application modules rather than duplicating business logic.

## Requirement Traceability

1. Endpoint for partial CPF filtering

- `app/api/filter-by-cpf/route.ts`

2. Reuse of existing filter-by-cpf business logic

- `src/filterByCpf/application/filter-by-cpf.service.ts`
- `src/filterByCpf/infrastructure/json-results.repository.ts`

3. Responsive, componentized filter page

- `app/page.tsx`
- `src/components/filter-by-cpf/filter-cpf-hero.tsx`
- `src/components/filter-by-cpf/filter-cpf-client.tsx`
- `src/components/filter-by-cpf/filter-cpf-results-table.tsx`

4. Friendly, reusable user feedback

- `src/components/shared/friendly-message.tsx`

5. API error contract (400/404/500)

- `app/api/filter-by-cpf/route.ts`

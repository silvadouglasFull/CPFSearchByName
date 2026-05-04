# Functional Specification - generatorCpf History UI

## Objective

Expose generatorCpf persistent history in the interface through tabs, including an explicit save action for generated records.

## Scope

- Add tabbed UI to generatorCpf page:
  - Search tab,
  - History tab.
- Add `Salvar Resultados` action in Search tab.
- Load paginated history in History tab.
- Display history list with generation metadata.

## User journey

1. User opens generatorCpf page.
2. User enters partial CPF and optional state region digit.
3. User runs generation and sees candidates.
4. User clicks `Salvar Resultados`.
5. System persists generated snapshot and confirms save status.
6. User opens `History` tab.
7. System lists saved snapshots with pagination controls.

## Inputs

Search and save:

- `partialCpf`
- optional `stateRegionDigit`
- `records` generated from `/api/generator-cpf`

History listing:

- `page` (default 1)
- `pageSize` (default 10)

## Outputs

Search tab:

- Generated CPF candidates table.
- Save success or error feedback.

History tab:

- Paginated saved snapshots containing:
  - partial CPF,
  - state region digit,
  - result count,
  - created timestamp.

## Business rules

- `Salvar Resultados` is enabled only when generation has at least one record.
- History is sorted by latest first.
- History tab performs lazy load on first open.
- Pagination supports previous/next navigation within valid bounds.

## Non-functional requirements

- Preserve responsive behavior on mobile and desktop.
- Use friendly feedback messages for save/list states.
- Keep UI aligned with existing component style baseline.

## Acceptance criteria

- Generator UI has Search and History tabs.
- Search tab saves generated results to history successfully.
- History tab shows paginated snapshots from API.
- Empty/loading/error states are visible and user-friendly.

## Requirement Traceability

1. Tabbed generator client

- `src/components/generator-cpf/generator-cpf-client.tsx`

2. History rendering

- `src/components/generator-cpf/generator-cpf-history-table.tsx`

3. API contracts consumed

- `app/api/generator-cpf-history/route.ts`

4. UI payload types

- `src/components/generator-cpf/types.ts`

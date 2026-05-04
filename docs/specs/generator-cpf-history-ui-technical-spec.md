# Technical Specification - generatorCpf History UI

## Overview

Integrate generatorCpf history persistence into the client UI by introducing tab state, save operation wiring, and paginated history loading.

## Current baseline

- Persistence is available through `generator_cpf_history` and API routes.
- Generator UI currently supports only generation and immediate in-memory result rendering.

## UI architecture

File: `src/components/generator-cpf/generator-cpf-client.tsx`

- Add tab state: `search | history`.
- Keep existing generation flow (`GET /api/generator-cpf`).
- Add save flow (`POST /api/generator-cpf-history`).
- Add history flow (`GET /api/generator-cpf-history?page=&pageSize=`).
- Add local states:
  - save/loading flags,
  - history loading flag,
  - paginated history payload,
  - history feedback message.

## New UI component

File: `src/components/generator-cpf/generator-cpf-history-table.tsx`

- Render history list in table layout.
- Columns:
  - partial CPF,
  - region digit,
  - saved results,
  - created at.
- Include item count badge and scrollable table container.

## Type contracts

File: `src/components/generator-cpf/types.ts`

Add:

- `GeneratorCpfHistoryRecord`
- `PaginatedGeneratorCpfHistory`

These types map API response payload used by client.

## API integration details

1. Save request

- Endpoint: `POST /api/generator-cpf-history`
- Body:
  - `partialCpf: string`
  - `stateRegionDigit: string | null`
  - `records: GeneratedCpfRecord[]`

2. History listing

- Endpoint: `GET /api/generator-cpf-history`
- Query:
  - `page`
  - `pageSize`
- Response:
  - paginated payload with `items`, `page`, `pageSize`, `totalItems`, `totalPages`.

## Validation and behavior

- Save action is blocked when there are no generated records.
- History pagination buttons are disabled at bounds.
- On API failures, show `FriendlyMessage` with error variant.

## Build and verification

- `npm run lint`
- `npm run build`

## Implementation Traceability

1. Main UI logic

- `src/components/generator-cpf/generator-cpf-client.tsx`

2. History table component

- `src/components/generator-cpf/generator-cpf-history-table.tsx`

3. Type definitions

- `src/components/generator-cpf/types.ts`

4. Consumed API routes

- `app/api/generator-cpf-history/route.ts`
- `app/api/generator-cpf-history/[id]/route.ts`

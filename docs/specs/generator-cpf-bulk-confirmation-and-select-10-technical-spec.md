# Technical Specification - Bulk Confirmation Modal and Select 10 at a Time

## Overview

Introduce modal-gated enqueue flow and 10-at-a-time selection controls in generator CPF result tables.

## Components

### 1. Confirmation modal state

File: `src/components/generator-cpf/generator-cpf-client.tsx`

Add state:

- `isBulkConfirmOpen`
- `bulkConfirmTargetName`
- `bulkConfirmSource: 'search' | 'history' | null`

Add handlers:

- open modal from enqueue button click,
- cancel modal,
- confirm modal (dispatches bulk action by source).

### 2. Results table controls

File: `src/components/generator-cpf/generator-cpf-results-table.tsx`

Extend props:

- `onSelectNextTen?: () => void`

Render button:

- visible only when selection mode is enabled.

### 3. Batch selection logic

File: `src/components/generator-cpf/generator-cpf-client.tsx`

Add functions:

- `selectNextTenCpfs(records)`
- `selectNextTenHistoryCpfs(records)`

Algorithm:

1. iterate records in UI order,
2. take first 10 CPFs not in current selection,
3. append to selected set.

### 4. Enqueue integration

- Reuse existing `handleBulkLookup` and `handleHistoryBulkLookup` with added `targetName` parameter.
- Send `targetName` in request body.

## UX constraints

- Confirm button disabled when loading or empty target name.
- Modal closes only after explicit cancel or successful request dispatch.

## Validation

- TypeScript compilation for new prop signatures.
- Manual testing for both search and history enqueue paths.

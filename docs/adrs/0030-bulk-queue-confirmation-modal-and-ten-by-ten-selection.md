# ADR 0030 - Bulk Queue Confirmation Modal and Ten-by-Ten Selection

## Status

Proposed

## Context

Bulk enqueue is currently immediate and can trigger expensive operations without explicit confirmation. Users also need an ergonomic way to select records progressively in fixed-size batches.

## Decision

1. Gate enqueue action behind a confirmation modal.
2. Require target person name input in the modal before allowing confirmation.
3. Add `Select next 10` control for progressive selection in both search and history result tables.

## Consequences

### Positive

- Prevents accidental high-cost bulk submissions.
- Captures required name input at the action boundary.
- Improves usability for large result sets.

### Negative

- Adds one extra user interaction step.
- Increases client-side state management complexity.

## Alternatives considered

1. Keep immediate enqueue and add only toast warning

- Rejected because warning is not a hard guard.

2. Add only `Select all`

- Rejected because requirement is explicit ten-by-ten progressive selection.

## Traceability

- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`
- `src/components/ui/dialog.tsx`

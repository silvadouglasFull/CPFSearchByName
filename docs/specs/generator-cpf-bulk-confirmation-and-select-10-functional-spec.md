# Functional Specification - Bulk Confirmation Modal and Select 10 at a Time

## Objective

Improve bulk operation safety and selection ergonomics by:

- requiring explicit confirmation with target name input,
- allowing users to select CPFs in 10-item batches.

## Scope

- `Queue selected CPFs` opens confirmation modal.
- Modal includes:
  - explanatory confirmation text,
  - input for person name,
  - cancel and confirm actions.
- Add `Select next 10` control in results table when selection mode is enabled.

## User journey

1. User enables selection mode.
2. User clicks `Select next 10` one or more times.
3. User clicks `Queue selected CPFs`.
4. Modal opens and requests target person name.
5. User confirms action.
6. System sends bulk request with selected CPFs + target name.

## Business rules

- Confirm action disabled while target name is empty.
- Cancel closes modal without enqueue.
- `Select next 10` selects the next unselected 10 records in current table order.
- If all records are selected, `Select next 10` resets/starts from the beginning (or no-op based on implementation consistency).

## Acceptance criteria

- Queue action no longer enqueues immediately.
- Modal is shown for both search and history flows.
- Target name is required to confirm enqueue.
- Users can progressively select records by 10-item batches.

## Traceability

- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`
- `src/components/ui/dialog.tsx`

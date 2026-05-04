# Functional Specification - get-cpfs-by-name Collection Progress UI

## Objective

Replace the generic loading state in the get-cpfs-by-name page with a live progress indicator that shows per-page collection status and accumulates records progressively as each portal page is processed.

## Scope

- Upgrade the BFF route to emit collection events as they occur.
- Display a visual progress indicator per portal page.
- Accumulate and render records as each page arrives.
- Surface individual page failures without stopping the overall flow.

## User journey

1. User enters a name and submits the search.
2. The page immediately shows a progress area indicating collection has started.
3. As each portal page is collected, the progress indicator updates: "Collecting page X of 6".
4. Records from each completed page are appended to the results table in real time.
5. When all pages finish, the progress area shows a completion summary.
6. If individual pages fail, a warning is shown per page without interrupting the others.
7. If collection fails fatally before any page, an error message is shown.

## Inputs

- `searchName` (required): same as before.

## Outputs

- Visual progress indicator showing:
  - current page being collected,
  - total number of pages,
  - per-page record count when a page completes,
  - per-page failure when a page errors.
- Results table updated progressively as records arrive.
- Completion summary with total record count.

## Business rules

- Progress tracking must reflect the same 6-page pagination used by the existing module.
- Individual page errors must be shown as warnings, not abort the collection.
- Fatal errors (e.g. invalid name, browser failure) must stop collection and show a friendly error message.

## Non-functional requirements

- Progress updates must arrive incrementally without requiring the full collection to finish.
- UI must handle partial results gracefully.
- Accessible progress indication with descriptive labels.

## Acceptance criteria

- Progress indicator appears immediately on submit.
- Each of the 6 pages is individually tracked in the progress area.
- Records in the table accumulate as pages complete rather than appearing all at once.
- A page failure shows a warning without breaking the overall progress.
- Completion state shows total records collected.

## Requirement Traceability

1. Streaming route with event protocol

- `app/api/get-cpfs-by-name/route.ts`

2. Progress event types

- `src/components/get-cpfs-by-name/types.ts`

3. Visual progress component

- `src/components/get-cpfs-by-name/get-cpfs-by-name-progress.tsx`

4. Progressive client orchestration

- `src/components/get-cpfs-by-name/get-cpfs-by-name-client.tsx`

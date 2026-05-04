# ADR 0010 - get-cpfs-by-name Collection Progress UI with SSE Streaming

## Status

Accepted

## Context

The `get-cpfs-by-name` page introduced in ADR 0009 calls a BFF endpoint that performs paginated Puppeteer collection across 6 portal pages sequentially with throttling.
Each full collection takes significant time, and the current implementation returns a single JSON response only after all pages are processed.

This creates a poor UX: the page stays in a generic loading state with no indication of how many pages have been processed or how many records were already found.

The following requirements must be addressed:

- Show which portal page is currently being collected.
- Show per-page record counts as they arrive.
- Accumulate and display records progressively instead of only after the full collection ends.
- Show errors for individual page failures without aborting the overall collection.

## Decision

The collection flow will be upgraded with these rules:

1. SSE streaming route

- The existing BFF Route Handler will be changed to return a `text/event-stream` response using a `ReadableStream`.
- The route emits a sequence of typed JSON events over the same connection.
- Runtime stays in Node.js with `force-dynamic`.

2. Typed event protocol

- `progress` — emitted before each page collection with `currentPage` and `totalPages`.
- `page` — emitted after each successful page collection with page number and the collected records slice.
- `page_error` — emitted when a single page fails, with page number and message; collection continues.
- `done` — emitted after all pages are processed and results are persisted, with total record count.
- `error` — emitted on a fatal error (e.g. invalid input, browser launch failure), followed by stream close.

3. Infrastructure reuse without service modification

- The streaming route directly uses `PuppeteerPortalSearchClient`, `PortalRecordMapper`, and `JsonPortalResultsWriter` from the existing module.
- `CollectPortalDataService` is not modified; the route orchestrates the same logic with stream emission between steps.
- Domain validation via `validateSearchName` is preserved.

4. Progressive UI with visual page progress

- A new `GetCpfsByNameProgress` component renders the per-page progress state.
- The client accumulates records progressively as `page` events arrive.
- Results table updates incrementally; a running total is always visible.

## Consequences

- Collection progress is transparent to the user for all 6 portal pages.
- Individual page failures are surfaced without aborting the session.
- Records appear progressively; the user does not have to wait for all pages to finish.
- The route contract changes from JSON to SSE; the existing client must be updated accordingly.

## Related ADRs

- ADR 0004 - Mandatory TypeScript Engineering Standard (Next.js Context)
- ADR 0005 - Next.js 16 Infrastructure Standard
- ADR 0009 - get-cpfs-by-name Module Reuse as Next.js Page with Sidebar and Home Links

## Traceability

1. Streaming BFF route

- `app/api/get-cpfs-by-name/route.ts`

2. Infrastructure reuse

- `src/getCpfsByName/infrastructure/puppeteer-portal-search.client.ts`
- `src/getCpfsByName/application/portal-record-mapper.ts`
- `src/getCpfsByName/infrastructure/json-portal-results.writer.ts`
- `src/getCpfsByName/domain/search-name.utils.ts`

3. Progress and streaming client layer

- `src/components/get-cpfs-by-name/types.ts`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-progress.tsx`
- `src/components/get-cpfs-by-name/get-cpfs-by-name-client.tsx`

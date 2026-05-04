# Technical Specification - get-cpfs-by-name Collection Progress UI

## Overview

Upgrade the get-cpfs-by-name page by replacing the single-response BFF route with a Server-Sent Events streaming route, and update the client to consume the event stream and render incremental progress.

## Event protocol

All events are emitted as SSE `data:` lines with newline-delimited JSON payloads.

```
data: {"type":"progress","currentPage":1,"totalPages":6}

data: {"type":"page","currentPage":1,"totalPages":6,"records":[...]}

data: {"type":"page_error","currentPage":2,"totalPages":6,"message":"..."}

data: {"type":"done","totalRecords":58}

data: {"type":"error","message":"..."}
```

## Streaming route changes

- File: `app/api/get-cpfs-by-name/route.ts`
- Response type: `text/event-stream`
- Headers: `Cache-Control: no-cache`, `Connection: keep-alive`
- Runtime: `nodejs`, `force-dynamic`

Flow inside the ReadableStream:

1. Validate `searchName`; emit `error` event and close on failure.
2. Open Puppeteer browser via `PuppeteerPortalSearchClient`.
3. For each page from `FIRST_PAGE_NUMBER` to `TOTAL_PAGES`:
   a. Emit `progress` event.
   b. Call `searchClient.collectPage(pageNumber)`.
   c. On success: map records via `PortalRecordMapper`, emit `page` event.
   d. On failure: emit `page_error` event, continue loop.
   e. Throttle between pages using `PAGE_THROTTLE_DELAY_MS`.
4. Persist all collected records via `JsonPortalResultsWriter`.
5. Emit `done` event with total count.
6. Close browser in `finally` block; close stream controller.

Infrastructure used directly (no service layer modification):

- `PuppeteerPortalSearchClient` — browser control and page collection.
- `PortalRecordMapper` — raw record mapping, same rules as before.
- `JsonPortalResultsWriter` — JSON persistence, unchanged.
- `validateSearchName` — input validation, unchanged.
- Domain constants `TOTAL_PAGES`, `FIRST_PAGE_NUMBER`, `PAGE_THROTTLE_DELAY_MS`.

## Client streaming consumption

- Use `fetch` with `response.body.getReader()`.
- Accumulate raw text across chunks; split on `\n` to extract `data:` lines.
- Parse each line and dispatch to state based on `type`.

State managed by `GetCpfsByNameClient`:

| State field    | Updated by event              |
| -------------- | ----------------------------- |
| `records`      | `page` (append)               |
| `currentPage`  | `progress`                    |
| `totalPages`   | `progress`                    |
| `pageStatuses` | `page`, `page_error`          |
| `totalRecords` | `done`                        |
| `isLoading`    | set false on `done` / `error` |
| `errorMessage` | `error`                       |

## Progress component

- File: `src/components/get-cpfs-by-name/get-cpfs-by-name-progress.tsx`
- Renders a row of `totalPages` step items.
- Each step shows: idle / in-progress (pulse) / success with record count / error with warning icon.
- Uses Tailwind classes and existing rounded visual language.

## Type additions in `types.ts`

```ts
export type CollectionEventType =
  | "progress"
  | "page"
  | "page_error"
  | "done"
  | "error";

export interface ProgressEvent {
  type: "progress";
  currentPage: number;
  totalPages: number;
}

export interface PageEvent {
  type: "page";
  currentPage: number;
  totalPages: number;
  records: PortalRecord[];
}

export interface PageErrorEvent {
  type: "page_error";
  currentPage: number;
  totalPages: number;
  message: string;
}

export interface DoneEvent {
  type: "done";
  totalRecords: number;
}

export interface ErrorEvent {
  type: "error";
  message: string;
}

export type CollectionEvent =
  | ProgressEvent
  | PageEvent
  | PageErrorEvent
  | DoneEvent
  | ErrorEvent;

export type PageStatus =
  | { state: "idle" }
  | { state: "collecting" }
  | { state: "done"; count: number }
  | { state: "error"; message: string };
```

## Build and validation

- `npm run lint`
- `npm run build`
- Manual checks:
  - Progress steps update as each page is collected.
  - Records appear in table before all pages finish.
  - Page error shows warning in that step without stopping others.
  - Done state shows total count.

## Implementation Traceability

1. Streaming route

- `app/api/get-cpfs-by-name/route.ts`

2. Event types

- `src/components/get-cpfs-by-name/types.ts`

3. Progress visual component

- `src/components/get-cpfs-by-name/get-cpfs-by-name-progress.tsx`

4. Streaming client orchestration

- `src/components/get-cpfs-by-name/get-cpfs-by-name-client.tsx`

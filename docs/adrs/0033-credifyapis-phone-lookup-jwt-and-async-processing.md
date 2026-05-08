# ADR 0033: Credify APIs Phone Lookup with Cached JWT and Asynchronous Queue Processing

**Status:** Accepted  
**Date:** 2026-05-07  
**Context:** The product needs a new `credifyapis` integration to resolve personal data from phone numbers. The flow must support provider authentication, persisted audit trail, bulk queueing via RabbitMQ, real-time progress updates, and a dedicated UI where users can submit a target phone number into the queue.

## Problem

How should the system integrate with Credify's phone lookup API while preserving reliability, auditability, and a consistent user experience for both single and bulk processing?

Credify imposes two relevant constraints:

1. Authentication is performed by `POST /auth` using `ClientID` and `ClientSecret`, returning a JWT valid for 24 hours.
2. Phone lookups are performed by `POST /pftelefone`, requiring `IdConsulta`, `Ddd`, `Telefone`, and `TipoPessoa`.

## Options Considered

### Option A: Call Credify directly from the UI synchronously ❌ REJECTED

The browser would trigger the provider request and wait for completion.

**Pros:**

- Lower initial backend surface area
- Simple single-request mental model

**Cons:**

- Exposes internal integration semantics to the UI
- Prevents safe use of `ClientID` and `ClientSecret`
- No durable queue for bulk or retriable workloads
- Weak audit trail and poor observability
- Hard to share the same execution path between single and mass lookups

### Option B: Backend-only synchronous API with no queue ❌ REJECTED

The UI would call an internal API that immediately authenticates and queries Credify in the request/response cycle.

**Pros:**

- Keeps credentials server-side
- Easier than queue-based orchestration

**Cons:**

- Poor fit for bulk processing
- User request stays open while external provider responds
- Harder to retry transient failures safely
- No natural real-time progress model for larger batches
- Single-number and mass flows diverge over time

### Option C: Backend queue-first architecture with cached JWT ✅ CHOSEN

All lookups, including single-number submissions from the UI, are normalized into queue jobs. The backend authenticates with Credify using `.env` credentials, caches the JWT until near expiry, publishes lookup items to RabbitMQ, persists every item/job transition, and broadcasts progress in real time.

**Pros:**

- One execution model for single and bulk lookups
- Credentials remain server-side
- Better resilience through retries and dead-letter handling
- Durable audit trail in PostgreSQL
- Natural fit for progress tracking and monitoring
- Easy to extend to CSV/import or other batch entry points later

**Cons:**

- More moving parts: token cache, queue, worker, progress channel
- Slightly higher latency for single lookups because enqueue/consume is mandatory
- Requires operational monitoring for RabbitMQ and worker health

## Decision

**Adopt a backend queue-first architecture for `credifyapis` phone lookup, authenticated with a cached JWT generated from environment-based `ClientID` and `ClientSecret`.**

### Rationale

1. **Security**: `ClientID` and `ClientSecret` must never leave the server. A backend-authenticated integration is mandatory.
2. **Consistency**: A single submission path supports one-off UI requests and future mass imports without creating a second implementation.
3. **Auditability**: Each queue item and each provider response can be persisted for history, troubleshooting, and compliance review.
4. **Operational resilience**: RabbitMQ allows bounded retries, dead-letter inspection, and worker isolation from the request cycle.
5. **User experience**: Real-time status updates can reflect queued, processing, success, not-found, and error states without blocking the browser.

## Key Consequences

### Authentication

- Credentials are read from `.env` as `CREDIFYAPIS_CLIENT_ID` and `CREDIFYAPIS_CLIENT_SECRET`.
- JWT generation is encapsulated in a backend auth service.
- The token is cached with an expiry safety window and refreshed when absent, expired, or rejected by the provider.

### Request orchestration

- UI submissions create a lookup job and one or more job items.
- Each item is published to RabbitMQ and processed by a worker.
- The worker generates a provider-facing `IdConsulta` per item.

### Persistence

- A dedicated lookup table stores normalized phone input, provider response code, mapped status, raw response, and timestamps.
- Job and job-item tables store queue lifecycle and progress counters.

### Real-time updates

- Workers emit progress events only after persistence succeeds.
- The frontend subscribes by `jobId` and reconciles with a snapshot endpoint after reconnect.

## Implementation Notes

- Credify response code mapping:
  - `1`: success
  - `2`: no data found
  - `3`: provider-side query error
- `TipoPessoa` is fixed to `F` for this first phase.
- No npm SDK dependency is required for this integration. Provider calls must be implemented with native `fetch` on the backend runtime.
- Because the documentation excerpt is ambiguous about body object casing (`Consulta` vs `CONSULTA`), the provider adapter must centralize payload formatting so implementation can verify and adjust with provider behavior tests, without leaking this concern across the codebase.

## Related Decisions

- ADR 0024: RabbitMQ for HubDo bulk lookup queueing
- ADR 0028: Socket.io + amqplib realtime status for bulk jobs
- Spec: [Credify APIs Phone Lookup Functional Specification](../specs/credifyapis-phone-lookup-functional-spec.md)
- Spec: [Credify APIs Phone Lookup Technical Specification](../specs/credifyapis-phone-lookup-technical-spec.md)

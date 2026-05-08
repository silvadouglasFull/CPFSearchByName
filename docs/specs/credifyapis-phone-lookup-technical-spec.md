# Technical Specification - Credify APIs Phone Lookup

## Overview

Implement a queue-first integration for Credify phone lookups. The architecture is composed of:

1. Auth service that generates and caches JWT from `POST /auth`
2. Provider client that calls `POST /pftelefone`
3. Repositories for lookup persistence and job lifecycle persistence
4. RabbitMQ publisher/consumer for asynchronous execution
5. Real-time progress projection for job updates
6. Dedicated UI page that submits a phone number into the queue and tracks the job

## External provider contract

### Auth endpoint

- Method: `POST`
- URL: `https://api.credify.com.br/auth`
- Request fields:
  - `ClientID: string`
  - `ClientSecret: string`
- Response fields:
  - `Success: boolean`
  - `Message: string`
  - `Dados: string` (JWT, valid for 24 hours)

### Phone lookup endpoint

- Method: `POST`
- URL: `https://api.credify.com.br/pftelefone`
- Authorization: `Bearer {jwt}`
- Request fields documented by provider:
  - `IdConsulta: string`
  - `Ddd: string`
  - `Telefone: string`
  - `TipoPessoa: string` (`F`)
- Response shape documented by provider includes:
  - `CONSULTA`
  - `RESPOSTA`
  - `CODIGO`
  - `BUSCATELEFONE`
  - records containing `CPF`, `NOME`, address fields, and `TP`

### Integration note

The documentation excerpt exposes the fields but is ambiguous about the body wrapper object casing (`Consulta` vs `CONSULTA`). The infrastructure client must isolate payload formatting behind a single adapter so implementation can verify the exact body shape with provider behavior tests, without affecting upstream application logic.

## HTTP transport (fetch, no SDK)

The integration must use native `fetch` in the backend runtime.

### Auth request (`POST /auth`) refactored from curl

```typescript
type CredifyAuthResponse = {
  Success: boolean;
  Message: string;
  Dados: string;
};

export async function fetchCredifyToken(): Promise<string> {
  const response = await fetch("https://api.credify.com.br/auth", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ClientID: process.env.CREDIFYAPIS_CLIENT_ID,
      ClientSecret: process.env.CREDIFYAPIS_CLIENT_SECRET,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Credify auth failed: ${response.status}`);
  }

  const payload = (await response.json()) as CredifyAuthResponse;
  if (!payload.Success || !payload.Dados) {
    throw new Error(payload.Message || "Credify auth returned no token");
  }

  return payload.Dados;
}
```

### Phone lookup request (`POST /pftelefone`) refactored from curl

```typescript
export async function fetchCredifyPhoneLookup(input: {
  token: string;
  idConsulta: string;
  ddd: string;
  telefone: string;
}) {
  const response = await fetch("https://api.credify.com.br/pftelefone", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      Authorization: `Bearer ${input.token}`,
    },
    body: JSON.stringify({
      IdConsulta: input.idConsulta,
      Ddd: input.ddd,
      Telefone: input.telefone,
      TipoPessoa: "F",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Credify phone lookup failed: ${response.status}`);
  }

  return response.json();
}
```

If provider validation indicates header incompatibility, keep the same `fetch` flow and adjust only the `Authorization` format in one place (for example, raw token instead of `Bearer`).

## Proposed module structure

Path: `src/credifyApis/`

### Domain layer

- `domain/types.ts`
- `domain/credify-phone-lookup.repository.ts`
- `domain/credify-phone-job.repository.ts`

### Application layer

- `application/credify-auth.service.ts`
- `application/credify-phone-lookup.service.ts`
- `application/credify-phone-bulk-enqueue.service.ts`
- `application/credify-phone-bulk-worker.service.ts`

### Infrastructure layer

- `infrastructure/http-credify-client.ts`
- `infrastructure/in-memory-credify-token-cache.ts` or reuse shared cache abstraction
- `infrastructure/drizzle-credify-phone-lookup.repository.ts`
- `infrastructure/drizzle-credify-phone-job.repository.ts`

## Domain contracts

### Lookup request model

```typescript
export interface CredifyPhoneLookupRequest {
  rawPhone: string;
  normalizedPhone: string;
  ddd: string;
  localNumber: string;
  tipoPessoa: "F";
  providerQueryId: string;
}
```

### Lookup result model

```typescript
export interface CredifyPhoneLookupResult {
  status: "success" | "not_found" | "error";
  providerCode: "1" | "2" | "3" | string;
  providerMessage?: string;
  cpf?: string;
  nome?: string;
  tpLogradouro?: string;
  logradouro?: string;
  numero?: string;
  endereco?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  phoneType?: string;
  rawResponse?: unknown;
}
```

### Queue job contracts

```typescript
export interface CredifyPhoneJobSummary {
  total: number;
  queued: number;
  processing: number;
  success: number;
  notFound: number;
  error: number;
  deadLetter: number;
}

export interface CredifyPhoneQueueMessage {
  jobId: string;
  itemId: string;
  phone: string;
  normalizedPhone: string;
  ddd: string;
  localNumber: string;
}
```

## Database schema

### Table: `credify_phone_lookups`

```typescript
{
  id: uuid (pk),
  jobId: uuid (nullable),
  jobItemId: uuid (nullable),
  rawPhone: text (not null),
  normalizedPhone: text (not null, indexed),
  ddd: text (not null),
  localNumber: text (not null),
  providerQueryId: text (not null, unique),
  status: text (not null), // queued | processing | success | not_found | error
  providerCode: text (nullable),
  providerMessage: text (nullable),
  cpf: text (nullable),
  nome: text (nullable),
  tpLogradouro: text (nullable),
  logradouro: text (nullable),
  numero: text (nullable),
  endereco: text (nullable),
  complemento: text (nullable),
  bairro: text (nullable),
  cidade: text (nullable),
  uf: text (nullable),
  cep: text (nullable),
  phoneType: text (nullable),
  errorCode: text (nullable),
  errorMessage: text (nullable),
  rawResponse: jsonb (nullable),
  createdAt: timestamptz,
  updatedAt: timestamptz,
  finishedAt: timestamptz (nullable)
}
```

Indexes:

- `credify_phone_lookups_normalized_phone_idx`
- `credify_phone_lookups_status_idx`
- `credify_phone_lookups_created_at_idx`

### Table: `credify_phone_lookup_jobs`

```typescript
{
  id: uuid (pk),
  source: text (not null), // ui_single | api_bulk | future_import
  status: text (not null), // queued | processing | completed | failed
  totalItems: integer (not null),
  queuedItems: integer (not null default 0),
  processingItems: integer (not null default 0),
  successItems: integer (not null default 0),
  notFoundItems: integer (not null default 0),
  errorItems: integer (not null default 0),
  deadLetterItems: integer (not null default 0),
  createdBy: text (nullable),
  createdAt: timestamptz,
  updatedAt: timestamptz,
  finishedAt: timestamptz (nullable)
}
```

### Table: `credify_phone_lookup_job_items`

```typescript
{
  id: uuid (pk),
  jobId: uuid (fk -> credify_phone_lookup_jobs.id),
  lookupId: uuid (fk -> credify_phone_lookups.id),
  rawPhone: text (not null),
  normalizedPhone: text (not null),
  ddd: text (not null),
  localNumber: text (not null),
  status: text (not null), // queued | processing | success | not_found | error | dead_letter
  attemptCount: integer (not null default 0),
  providerQueryId: text (not null, unique),
  providerCode: text (nullable),
  errorCode: text (nullable),
  errorMessage: text (nullable),
  createdAt: timestamptz,
  updatedAt: timestamptz,
  finishedAt: timestamptz (nullable)
}
```

Indexes:

- `credify_phone_lookup_job_items_job_id_idx`
- `credify_phone_lookup_job_items_status_idx`
- unique optional dedupe: `(jobId, normalizedPhone)`

## Service design

### `CredifyAuthService`

Responsibilities:

- Read `CREDIFYAPIS_CLIENT_ID` and `CREDIFYAPIS_CLIENT_SECRET`
- Request JWT from Credify auth endpoint
- Cache token with expiry metadata
- Refresh token when expired or rejected

Suggested interface:

```typescript
export interface CredifyTokenPayload {
  token: string;
  expiresAt: Date;
}

export class CredifyAuthService {
  async getValidToken(forceRefresh?: boolean): Promise<CredifyTokenPayload>;
}
```

### `CredifyPhoneLookupService`

Responsibilities:

- Validate and normalize phone input
- Split phone into `ddd` and `localNumber`
- Generate provider-facing `IdConsulta`
- Obtain JWT through `CredifyAuthService`
- Call infrastructure client
- Map provider response codes into domain statuses
- Persist lookup record updates

### `CredifyPhoneBulkEnqueueService`

Responsibilities:

- Normalize incoming single or multiple phones
- Create job and job-item records
- Publish one RabbitMQ message per item
- Return initial job snapshot

### `CredifyPhoneBulkWorkerService`

Responsibilities:

- Consume queue messages
- Mark item as `processing`
- Execute lookup service
- Persist terminal state
- Update job counters
- Emit realtime projections

## Provider client

File: `src/credifyApis/infrastructure/http-credify-client.ts`

```typescript
export class CredifyHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly authService: CredifyAuthService,
  ) {}

  async lookupPhone(
    input: CredifyPhoneLookupRequest,
  ): Promise<CredifyPhoneLookupResult> {
    // 1. Get token
    // 2. Build provider payload
    // 3. POST /pftelefone via fetch
    // 4. On 401, refresh token once and retry once
    // 5. Map response body to domain result
  }
}
```

## RabbitMQ topology

### Exchange

- `credify.phone.lookup.exchange` (type: direct)

### Main queue

- `credify.phone.lookup.queue`
- Durable: `true`
- Routing key: `credify.phone.lookup.item`

### Dead-letter

- Exchange: `credify.phone.lookup.dlx`
- Queue: `credify.phone.lookup.dlq`
- Routing key: `credify.phone.lookup.item.dead`

### Message properties

- `messageId`: queue item id
- `correlationId`: job id
- headers:
  - `x-job-id`
  - `x-item-id`
  - `x-attempt`

## Queue processing rules

1. API persists job and item records before publish.
2. Publish one message per item.
3. Worker marks item `processing` before calling provider.
4. Success result updates item and lookup to `success`.
5. Provider code `2` updates item and lookup to `not_found`.
6. Provider code `3` updates item and lookup to `error`.
7. Transient failures are retried until `CREDIFYAPIS_MAX_RETRIES`.
8. Retry exhaustion routes message to DLQ and marks item `dead_letter`.
9. Job summary is recomputed after every terminal transition.

## Realtime architecture

### Event channel

Reuse the existing socket-based realtime approach used for bulk jobs.

Suggested namespace and room:

- Namespace: `/credify-phone-lookup`
- Room: `credify:phone:job:{jobId}`

### Server events

- `credify.phone.job.subscribed`
- `credify.phone.item.updated`
- `credify.phone.job.updated`
- `credify.phone.job.completed`
- `credify.phone.job.failed`

### Payload shape

```json
{
  "jobId": "uuid",
  "itemId": "uuid",
  "status": "processing",
  "normalizedPhone": "11999998888",
  "attemptCount": 1,
  "providerCode": null,
  "updatedAt": "2026-05-07T12:00:00.000Z"
}
```

## API design

### POST `/api/credifyapis-phone-lookup`

Single-number enqueue.

Request:

```json
{
  "phone": "(11) 99999-8888"
}
```

Response `202`:

```json
{
  "jobId": "uuid",
  "status": "queued",
  "summary": {
    "total": 1,
    "queued": 1,
    "processing": 0,
    "success": 0,
    "notFound": 0,
    "error": 0
  }
}
```

### POST `/api/credifyapis-phone-lookup/bulk`

Batch enqueue for internal or future UI use.

Request:

```json
{
  "phones": ["11999998888", "21988887777"]
}
```

### GET `/api/credifyapis-phone-lookup/jobs/[jobId]`

Returns job metadata, summary counters, and optional item list.

### GET `/api/credifyapis-phone-lookup/history`

Returns paginated historical lookup records.

Optional filters:

- `phone`
- `status`
- `page`
- `pageSize`

## UI composition

### Route

- `app/credifyapis-phone-lookup/page.tsx`

### Client responsibilities

- Render phone input form
- Submit enqueue request
- Show immediate queued feedback
- Subscribe to realtime job updates
- Reconcile with status endpoint on reconnect
- Render final result and history list

### Suggested components

- `credify-phone-lookup-client.tsx`
- `credify-phone-submit-form.tsx`
- `credify-phone-job-progress.tsx`
- `credify-phone-result-card.tsx`
- `credify-phone-history-table.tsx`

## Environment configuration

```bash
CREDIFYAPIS_BASE_URL=https://api.credify.com.br
CREDIFYAPIS_CLIENT_ID=
CREDIFYAPIS_CLIENT_SECRET=
CREDIFYAPIS_TOKEN_EXPIRY_SKEW_SECONDS=300
CREDIFYAPIS_TIMEOUT_MS=30000
CREDIFYAPIS_MAX_RETRIES=3
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_PREFETCH=10
```

## Error handling strategy

| Scenario                         | Internal code            | Item status                        | Retry                      |
| -------------------------------- | ------------------------ | ---------------------------------- | -------------------------- |
| Invalid phone input              | `INVALID_PHONE`          | `error`                            | No                         |
| Auth request failure             | `AUTH_FAILED`            | `error`                            | Yes, bounded               |
| Lookup request timeout           | `PROVIDER_TIMEOUT`       | `error`                            | Yes                        |
| Provider 401                     | `TOKEN_REJECTED`         | `error` after forced refresh fails | One forced refresh + retry |
| Provider code 2                  | `NOT_FOUND`              | `not_found`                        | No                         |
| Provider code 3                  | `PROVIDER_QUERY_ERROR`   | `error`                            | No                         |
| Unexpected payload mapping error | `RESPONSE_MAPPING_ERROR` | `error`                            | No                         |

## Validation strategy

### Automated

- schema migration generation
- repository tests for job counters and history queries
- service tests for phone normalization and status mapping
- integration tests for enqueue -> consume -> persist -> realtime emission

### Manual

1. Submit a valid phone number from the page.
2. Confirm a `202` response with `jobId`.
3. Observe item moving from `queued` to `processing` to terminal state.
4. Confirm persisted history record includes raw response and mapped status.
5. Force token invalidation and confirm refresh path runs once.

## Rollout plan

1. Add schema and migrations for lookup/job tables.
2. Implement provider auth and phone client.
3. Add repositories and application services.
4. Add RabbitMQ publisher and consumer.
5. Add realtime projection for job progress.
6. Add enqueue page and history/status APIs.

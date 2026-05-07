# Technical Specification - HubDo Bulk Lookup Name Match and Exclusion Persistence

## Overview

Enhance bulk enqueue and worker processing to support target-name-based CPF classification.

## Design

### 1. API contract update

File: `app/api/hubdo-cpf-lookup/bulk/route.ts`

- Add required body field: `targetName: string`.
- Validate non-empty name.
- Pass `targetName` to application service.

### 2. Service orchestration

File: `src/hubdoCpf/application/hubdo-bulk-lookup.service.ts`

- Accept `targetName` in `enqueueBulkJob` input.
- Normalize `targetName` for deterministic matching key.
- Query repository for excluded CPFs for normalized target name.
- Remove excluded CPFs before job creation.

### 3. Repository and schema

Files:

- `src/hubdoCpf/domain/bulk-lookup-types.ts`
- `src/hubdoCpf/infrastructure/drizzle-hubdo-bulk-lookup.repository.ts`
- `src/database/schema.ts`

Add persistence structures for:

- name matches,
- name exclusions.

Add repository methods:

- `getExcludedCpfsForTargetName(targetName: string): Promise<string[]>`
- `recordNameMatch(input): Promise<void>`
- `recordNameExclusion(input): Promise<void>`
- `getJobById(jobId: string): Promise<HubdoBulkLookupJob | null>` (for worker name context)

### 4. Worker classification logic

File: `src/queue/rabbitmq/hubdo-bulk-consumer.ts`

- Resolve target name for each job (cache by `jobId` in-memory).
- On successful lookup with returned person name:
  - compare normalized names,
  - persist match or exclusion accordingly.

Name normalization strategy:

- lowercase,
- Unicode NFD accent stripping,
- trim and collapse spaces.

### 5. Compatibility

- Keep existing bulk summary and status endpoints.
- Do not change item status semantics (`success` means HubDo request succeeded, not name match).

## Failure handling

- If persistence of match/exclusion fails, item processing should still continue, but error should be logged.
- Only successful HubDo responses can produce match/exclusion decision.

## Test plan

1. Enqueue with missing `targetName` returns 400.
2. Enqueue with target name skips already excluded CPFs.
3. Worker persists match when names are equivalent under normalization.
4. Worker persists exclusion when names differ.
5. Existing job status counters and realtime events remain intact.

## Build and validation

- `npm run build`
- Manual end-to-end bulk run with repeated enqueue for same target name.

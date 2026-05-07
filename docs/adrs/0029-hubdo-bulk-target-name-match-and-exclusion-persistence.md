# ADR 0029 - HubDo Bulk Target Name Match and Exclusion Persistence

## Status

Proposed

## Context

Bulk HubDo lookup currently validates CPF data but does not classify results against a user-provided target name. Users need to identify which selected CPFs belong to a specific person and avoid reprocessing known non-matching CPFs.

## Decision

1. Add mandatory `targetName` to bulk enqueue requests.
2. Persist match and exclusion artifacts during worker processing.
3. Reuse persisted exclusions to skip CPFs in future enqueue operations for the same target name.
4. Keep HubDo lookup status semantics independent from name-match semantics.

## Consequences

### Positive

- Reduces repeated credit consumption for known non-matching CPFs.
- Produces explicit evidence of matching and non-matching outcomes.
- Preserves current queue and status architecture.

### Negative

- Adds schema and repository complexity.
- Introduces name normalization and comparison rules that must remain stable.

## Alternatives considered

1. Frontend-only filtering without persistence

- Rejected due to loss of cross-session memory.

2. Persist only matches and ignore non-matches

- Rejected because exclusion persistence is the key optimization requirement.

## Traceability

- `app/api/hubdo-cpf-lookup/bulk/route.ts`
- `src/hubdoCpf/application/hubdo-bulk-lookup.service.ts`
- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`
- `src/hubdoCpf/infrastructure/drizzle-hubdo-bulk-lookup.repository.ts`
- `src/database/schema.ts`

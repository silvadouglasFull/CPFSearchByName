# ADR 0025 - FK from generatorCpf History Records to HubDo CPF Lookups

## Status

Proposed

## Context

The table `generator_cpf_history_records` stores persisted CPFs generated in history snapshots.
The table `hubdo_cpf_lookups` stores verification executions against HubDo service.

A new requirement needs an explicit relational link so the system can identify whether a persisted generated CPF has already been verified by HubDo.

Today this verification state depends on indirect checks (such as searching by CPF value), which is less explicit and harder to consume in history flows.

## Decision

1. Add a nullable FK in `generator_cpf_history_records`

- New column: `hubdo_lookup_id uuid null`
- FK target: `hubdo_cpf_lookups.id`
- Referential action: `ON DELETE SET NULL`

2. Treat linked lookup as verification evidence

- `hubdo_lookup_id IS NOT NULL` means the persisted generated CPF has already been verified at least once.
- `hubdo_lookup_id IS NULL` means no linked verification was registered yet.

3. Keep relationship optional for backward compatibility

- Existing historical rows remain valid and initially unlinked.
- Link can be populated when lookup is executed from history/search bulk flows or by backfill process.

4. Prefer latest successful lookup when relinking

- If multiple lookups exist for the same CPF, application logic should link the most recent valid lookup (recommended: latest `created_at`, preferring `request_status = 'OK'` when business flow allows).

## Consequences

### Positive

- Verification state becomes explicit per persisted generated CPF record.
- History UI can display whether each CPF was already verified without expensive inference.
- Enables future reporting based on direct relational links.

### Negative

- Requires schema migration and repository/service updates.
- Link may become stale if a newer lookup exists and relinking policy is not applied.

### Mitigation

- Define deterministic relinking policy in service layer.
- Add index on `hubdo_lookup_id` for query efficiency.
- Keep `ON DELETE SET NULL` to preserve history rows when lookup records are removed.

## Related ADRs

- ADR 0017 - generatorCpf History with Normalized CPF Records and History Details Action
- ADR 0019 - HubDo CPF WebService Integration
- ADR 0023 - Generator CPF Multi-Selection and Bulk HubDo Lookup
- ADR 0024 - RabbitMQ Queueing for HubDo Bulk CPF Lookup

## Traceability

1. Schema

- `src/database/schema.ts`

2. History persistence and relinking

- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`
- `src/generatorCpfHistory/application/generator-cpf-history.service.ts`

3. HubDo lookup orchestration

- `src/hubdoCpf/application/hubdo-cpf-lookup.service.ts`
- `app/api/hubdo-cpf-lookup/bulk/route.ts`

4. History visualization and status usage

- `src/components/generator-cpf/generator-cpf-client.tsx`
- `src/components/generator-cpf/generator-cpf-results-table.tsx`

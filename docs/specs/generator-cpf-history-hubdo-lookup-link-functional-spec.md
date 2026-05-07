# Functional Specification - Link generated history CPF record to HubDo lookup

## Objective

Allow the system to know, for each persisted generated CPF in history, whether it has already been verified by HubDo through an explicit FK relationship.

## Scope

- Add a direct relationship from `generator_cpf_history_records` to `hubdo_cpf_lookups`.
- Consider linked records as "already verified" in history flows.
- Preserve compatibility for legacy records that do not yet have a linked lookup.

## User/business value

- Operators can quickly identify verified vs non-verified generated CPFs in history.
- Bulk verification workflows can avoid duplicate effort by checking link state.
- Reporting can rely on explicit relational data rather than heuristic matching.

## Business rules

1. Verification status by link

- `hubdo_lookup_id` filled: record is verified.
- `hubdo_lookup_id` empty: record is not verified yet.

2. Legacy compatibility

- Existing history records remain valid with null link.
- Null link must not break history listing/details.

3. Link lifecycle

- Link should be set when a CPF history record is verified via HubDo flow.
- If linked HubDo lookup is removed, history record remains and link is cleared (`ON DELETE SET NULL`).

4. Multiple lookups for same CPF

- System should keep a deterministic policy to link one lookup record (recommended latest eligible lookup).

## Inputs

- Persisted history CPF record (`generator_cpf_history_records.id`)
- Existing HubDo lookup record (`hubdo_cpf_lookups.id`)

## Outputs

- A persisted FK value (`hubdo_lookup_id`) in history record.
- Ability to derive `alreadyVerified` state from FK presence.

## Acceptance criteria

- Schema contains nullable `hubdo_lookup_id` FK in `generator_cpf_history_records` pointing to `hubdo_cpf_lookups.id`.
- Existing history records continue to work without mandatory relink.
- Deleting a linked HubDo lookup does not delete history record and clears the FK.
- History flows can identify if persisted CPF has already been verified by evaluating FK nullability.

## Requirement traceability

1. Schema definition

- `src/database/schema.ts`

2. Database migration

- `drizzle/` (new migration file)

3. History/HubDo integration points

- `src/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository.ts`
- `src/hubdoCpf/application/hubdo-cpf-lookup.service.ts`

# Functional Specification - HubDo Bulk Lookup Name Match and Exclusion Persistence

## Objective

Allow users to enqueue selected CPFs with a target person name and automatically classify results into:

- matching CPFs (belong to the informed name),
- non-matching CPFs (should be excluded from future searches for the same name).

## Scope

- Add required `targetName` input for bulk enqueue actions.
- Persist name-match and name-exclusion outcomes during worker processing.
- Reuse persisted exclusions to skip previously rejected CPFs for the same target name.
- Keep existing HubDo lookup flow and RabbitMQ processing.

## User journey

1. User selects one or more CPFs.
2. User clicks `Queue selected CPFs`.
3. Confirmation modal asks for operation confirmation and target person name.
4. System enqueues selected CPFs with `targetName`.
5. Worker performs HubDo lookup for each item.
6. For successful lookup with person name returned:
   - if name matches target: persist match data (CPF, name, birth date),
   - if name differs: persist CPF as exclusion for that target name.
7. In future enqueue operations for same target name, excluded CPFs are skipped.

## Inputs

### UI

- `selectedCpfs: string[]`
- `targetName: string` (required)
- `mode: 'normal' | 'turbo'`

### API

`POST /api/hubdo-cpf-lookup/bulk`

```json
{
  "cpfs": ["12345678901"],
  "mode": "normal",
  "targetName": "Vanessa Silva dos Reis"
}
```

## Outputs

### Persistence

- Match records containing at least:
  - `cpf`
  - `targetName`
  - `foundName`
  - `foundBirthDate`
  - `jobId`
- Exclusion records containing at least:
  - `cpf`
  - `targetName`
  - `lastFoundName`
  - `lastFoundBirthDate`
  - `jobId`

### API response

Bulk enqueue response remains compatible and may include informational counters for skipped CPFs.

## Business rules

- `targetName` is mandatory for bulk enqueue.
- Name comparison must be case-insensitive and accent-insensitive.
- Exclusion is persisted only when lookup succeeded and returned a non-matching person name.
- Failed lookups (timeout, token, service errors) are not treated as exclusion evidence.
- Already excluded CPF for same target name is skipped in next enqueue for that name.

## Acceptance criteria

- Queue action requires user-provided target name.
- Backend rejects bulk enqueue without `targetName`.
- Worker persists match and exclusion records when applicable.
- Re-enqueue for same target name skips previously excluded CPFs.
- Existing realtime and polling job updates continue working.

## Traceability

- `src/components/generator-cpf/generator-cpf-client.tsx`
- `app/api/hubdo-cpf-lookup/bulk/route.ts`
- `src/hubdoCpf/application/hubdo-bulk-lookup.service.ts`
- `src/queue/rabbitmq/hubdo-bulk-consumer.ts`
- `src/hubdoCpf/infrastructure/drizzle-hubdo-bulk-lookup.repository.ts`
- `src/database/schema.ts`

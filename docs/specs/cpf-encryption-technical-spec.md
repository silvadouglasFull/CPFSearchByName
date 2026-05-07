# Technical Specification - CPF Encryption at Rest and Hash-Based Lookup

## Overview

Implement a shared server-side CPF protection layer for this Next.js + Drizzle + PostgreSQL application, based on ADR 0021. The implementation must encrypt persisted CPF values at rest, support exact-match lookup through keyed hashes, and define a migration path table by table.

In the upstream reference, `taxId` is conceptually the same as CPF. In this repository, CPF remains the canonical domain term.

## Goals

- Eliminate plain-text CPF persistence from exact-match and audit workflows
- Keep exact CPF lookup performant through indexed keyed hashes
- Centralize normalization, validation, encryption, decryption, hashing, and masking
- Prepare additive, low-risk migrations that do not break current features

## Non-Goals

- Solving privacy-preserving partial CPF search in this rollout
- Encrypting every CPF-bearing structure in one migration batch
- Supporting client-side cryptography for CPF persistence

## Runtime and Library Choices

### Crypto Runtime

- Use `node:crypto`
- Algorithm: `AES-256-GCM`
- IV size: `12 bytes`
- Auth tag size: `16 bytes`

### Validation

- Use `cpf-cnpj-validator` for full CPF validation and formatting
- Normalize to digits only before validation, hashing, or encryption

### Lookup Hash

- Use `HMAC-SHA-256`
- Store result as lowercase hex string
- Never use raw SHA-256 for CPF lookup because CPF has a small brute-forceable input space

## Environment Variables

Required server-side secrets:

- `CPF_ENCRYPTION_KEY`
  - 32-byte secret
  - Accept hex or base64 encoded value
- `CPF_HASH_KEY`
  - Secret for HMAC generation
  - Can be any sufficiently random string or encoded binary value

## Shared Module Design

### File: `src/security/cpf-protection.ts`

Responsibilities:

- `normalizeCpf(value)`
- `isValidCpf(value)`
- `assertValidCpf(value)`
- `formatCpf(value)`
- `maskCpf(value)`
- `hashCpf(value)`
- `encryptCpf(value)`
- `decryptCpf(payload)`
- `matchesCpfHash(cpfValue, hashValue)`

Implementation notes:

- All outputs from `encryptCpf`, `decryptCpf`, and `hashCpf` operate on normalized CPF digits
- `decryptCpf` returns normalized digits, not formatted display strings
- The encrypted payload format is:

```text
version:ivHex:authTagHex:ciphertextHex
```

Versioning allows future key rotation or payload format changes.

## Drizzle Integration Design

### File: `src/database/custom-types/encrypted-cpf.ts`

Provide a reusable custom type:

```typescript
export const encryptedCpf = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'text';
  },
  toDriver(value) {
    return encryptCpf(value);
  },
  fromDriver(value) {
    return decryptCpf(value);
  },
});
```

This keeps repository code working with plain normalized CPF strings while the database stores ciphertext.

## Schema Pattern

For exact-match searchable CPF fields, use:

```typescript
cpfEncrypted: encryptedCpf('cpf_encrypted').notNull(),
cpfHash: text('cpf_hash').notNull(),
```

Constraints:

- Add index on `cpf_hash`
- Add uniqueness only where the domain requires unique CPF per row
- Do not query the encrypted column for equality

## Repository Pattern

### Writes

- Normalize CPF
- Validate CPF where the use case requires full CPF
- Set `cpfEncrypted` from the custom type
- Set `cpfHash` from `hashCpf(normalizedCpf)`

### Reads

- Drizzle decrypts `cpfEncrypted` through `fromDriver`
- Domain objects may continue exposing `cpf`

### Exact lookup

Replace:

```typescript
eq(table.cpf, normalizedCpf)
```

With:

```typescript
eq(table.cpfHash, hashCpf(normalizedCpf))
```

## Migration Strategy

Use additive migrations and backfill.

Common steps for each eligible table:

1. Add `*_encrypted` and `*_hash` columns
2. Backfill from existing plain-text CPF values
3. Add indexes and constraints
4. Switch repositories to the new columns
5. Remove or deprecate plain-text reliance after verification

Backfill rules:

- Run server-side only
- Never log decrypted CPF values
- Skip or quarantine invalid legacy rows explicitly

## Migration Plan by Table

### 1. `hubdo_cpf_lookups`

Classification:
- Phase 1
- Exact lookup and audit table

Current CPF usage:
- Stores full CPF in plain text
- Supports history listing and `listByCpf` / `getLatestByCpf`

Planned schema changes:
- Add `cpf_encrypted text`
- Add `cpf_hash text`
- Add index on `cpf_hash`

Repository changes:
- Write `cpf_hash` for every insert
- Read CPF from `cpf_encrypted`
- Query by `cpf_hash` for exact CPF lookup

Migration notes:
- This is the first table to migrate because it has the clearest exact-match semantics and limited UI dependencies

### 2. `get_cpfs_by_name_search_records`

Classification:
- Deferred
- Full CPF stored, but also used by search screens that currently support partial CPF matching

Current CPF usage:
- Stores collected CPF values from portal results
- Used by search APIs with partial CPF matching

Planned action:
- Do not encrypt in Phase 1
- Keep as-is until a follow-up design exists for privacy-preserving partial search

Migration notes:
- Requires a separate strategy for substring search, likely using derived search tokens or a secondary searchable representation
- Must be covered by a follow-up ADR/spec before implementation

### 3. `filter_cpf_search_history`

Classification:
- Deferred and redesign required
- Stores `resultRecords` JSON snapshots that may embed full CPF values

Current CPF usage:
- CPF values are embedded inside JSONB snapshots, not normalized into a relational child table

Planned action:
- Do not encrypt JSON in place in Phase 1
- Replace or complement JSON snapshots with normalized history record tables in a later phase

Migration notes:
- This table should be redesigned before CPF encryption rollout because field-level searchable encryption inside JSONB snapshots is operationally poor

### 4. `generator_cpf_history`

Classification:
- No action in Phase 1

Current CPF usage:
- Stores partial CPF only
- Does not store a full CPF value directly

Planned action:
- Keep unchanged for now

Migration notes:
- Partial CPF is still sensitive and must be revisited later, but this ADR rollout targets full CPF exact-match persistence first

### 5. `generator_cpf_history_records`

Classification:
- Deferred to Phase 2

Current CPF usage:
- Stores generated full CPF values, formatted CPF values, and base nine digits

Planned schema changes:
- Add `cpf_encrypted text`
- Add `cpf_hash text`
- Remove long-term dependency on `formattedCpf` as persisted plain text

Migration notes:
- Depends on product decision about whether generated CPF candidates must remain directly searchable or can be displayed only from decrypted values
- `baseNineDigits` also needs review because it is still a sensitive derivative

### 6. Future payment/user identity tables

Classification:
- Mandatory from creation date

Planned action:
- New tables must not introduce plain-text CPF columns
- Use encrypted + hash pair from day one

## Initial Implementation Slice

This first implementation slice includes:

- shared CPF protection module
- Drizzle encrypted CPF custom type
- technical specification and migration plan

This slice intentionally does not yet:

- alter existing table schemas
- backfill current records
- refactor existing repositories to encrypted storage

## Implementation Sequence

1. Add shared crypto/hash module
2. Add Drizzle custom type
3. Migrate `hubdo_cpf_lookups`
4. Update HubDo repository queries to use `cpf_hash`
5. Add operational backfill script for `hubdo_cpf_lookups`
6. Validate production rollout
7. Design a separate spec for partial CPF search tables

## Validation Strategy

### Unit Checks

- Normalize CPF to digits only
- Reject invalid CPF values
- Encrypt then decrypt returns the original normalized CPF
- Distinct encryptions of the same CPF produce different ciphertext
- HMAC hash is stable for the same normalized CPF and key
- `matchesCpfHash` is timing-safe and correct

### Integration Checks

- Drizzle custom type encrypts on write and decrypts on read
- Exact lookup by `cpf_hash` returns expected records
- Legacy backfill does not lose rows

## Risks and Mitigations

### Risk: Missing or malformed secrets

Mitigation:
- Fail fast when crypto functions are called without valid keys

### Risk: Breaking partial CPF search features

Mitigation:
- Explicitly exclude those tables from Phase 1 migration

### Risk: Data leakage through logs

Mitigation:
- Never log raw CPF, decrypted CPF, or ciphertext payloads in backfill scripts or runtime errors
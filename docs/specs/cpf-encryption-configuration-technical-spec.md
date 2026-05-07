# Technical Specification - CPF Encryption Configuration Persistence and Management

## Overview

Implement a new backend module and admin UI for persisted CPF encryption configurations. The solution must version encryption configurations, guarantee exactly one current configuration, and never expose secret-bearing data or the backend algorithm constant to the browser.

This specification extends ADR 0021 and is governed by ADR 0022.

## Terminology clarification

- `CPF_ENCRYPTION_ALGORITHM` remains a backend constant with value `aes-256-gcm`.
- The generated sensitive value is the encryption key material used with that algorithm.
- In implementation, any “generate algorithm” request must be interpreted as “generate a new encryption key compatible with the fixed algorithm.”

## Security model

### Key hierarchy

1. Master key

- New environment variable: `CPF_CONFIG_MASTER_KEY`
- 32-byte server-side secret, hex or base64 encoded
- Used only to encrypt and decrypt persisted CPF encryption key material

2. Persisted CPF encryption key material

- Generated with `randomBytes(32)`
- Stored only as encrypted payload in PostgreSQL
- Decrypted only on the server when the current CPF encryption configuration is resolved

3. Hash key

- `CPF_HASH_KEY` remains environment-managed in this phase
- No schema or UI changes for hash-key rotation in this slice

## Schema design

### Table: `cpf_encryption_configurations`

Recommended columns:

- `id uuid primary key default gen_random_uuid()`
- `version text not null unique`
- `is_current boolean not null default false`
- `status text not null default 'active'`
- `key_ciphertext text not null`
- `key_fingerprint text not null unique`
- `key_version text not null`
- `notes text`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

### Database constraints

- Unique constraint on `version`
- Unique constraint on `key_fingerprint`
- Partial unique index to enforce a single current configuration:

```sql
create unique index cpf_encryption_configurations_single_current_idx
on cpf_encryption_configurations ((is_current))
where is_current = true;
```

### Rationale for omitted fields in public API

The following fields exist only in server-side persistence and internal models:

- `key_ciphertext`
- backend algorithm constant
- any decrypted key material

These must not be serialized into public DTOs.

## Module structure

```text
src/cpfEncryptionConfig/
  domain/
    types.ts
  application/
    cpf-encryption-config.service.ts
  infrastructure/
    drizzle-cpf-encryption-config.repository.ts
  index.ts
```

## Domain model

### Internal record

`CpfEncryptionConfigurationRecord`

- includes all DB fields, including `keyCiphertext`

### Public DTO

`CpfEncryptionConfigurationSummary`

- `id`
- `version`
- `isCurrent`
- `status`
- `keyVersion`
- `keyFingerprintPreview` or masked fingerprint
- `notes`
- `createdAt`
- `updatedAt`

No secret-bearing fields in this DTO.

### Repository contract

Required methods:

- `create(input)`
- `getById(id)`
- `getCurrent()`
- `update(id, updates)`
- `delete(id)`
- `list(params)`
- `createAsCurrent(input)` or equivalent transactional current-switch operation

### Service contract

Required methods:

- `createConfiguration(input)`
- `getConfiguration(id)`
- `getCurrentConfiguration()`
- `updateConfiguration(id, input)`
- `deleteConfiguration(id)`
- `listConfigurations(params)`
- `rotateCurrentConfiguration(input?)`
- `resolveCurrentEncryptionKey()`

## Backend crypto helpers

### Existing file extension

File: `src/security/cpf-protection.ts`

Add helpers for configuration-key protection:

- `generateCpfEncryptionKey(): Buffer`
- `encryptConfigurationKeyMaterial(rawKey: Buffer): string`
- `decryptConfigurationKeyMaterial(payload: string): Buffer`
- `generateConfigurationFingerprint(rawKey: Buffer): string`

The existing CPF encryption helpers should stop resolving the runtime encryption key directly from `CPF_ENCRYPTION_KEY` once this new configuration module is adopted. Instead, the backend should resolve the current configuration through the service/repository.

## CRUD behavior

### Create

- Validate unique version
- Generate a fresh encryption key
- Encrypt key material with `CPF_CONFIG_MASTER_KEY`
- Compute non-reversible fingerprint
- Persist row
- Optionally mark as current when explicitly requested and when transactional switching is applied

### Update

- Allow updating safe metadata only:
  - `notes`
  - `status` when not conflicting with current lifecycle rules
- Do not allow direct editing of `key_ciphertext`, key material, algorithm, or fingerprint from frontend flows

### Delete

- Reject deletion if `is_current = true`
- Prefer delete only for rows not yet referenced operationally; otherwise use status retirement

### List paginated

Parameters:

- `page`
- `pageSize`
- optional `status`
- optional `currentOnly`

Return shape:

- `items`
- `page`
- `pageSize`
- `totalItems`
- `totalPages`

Items must be public summaries only.

## Rotation flow

### Function

`rotateCurrentConfiguration()`

### Steps

1. Start DB transaction
2. Read current configuration if present
3. Generate new 32-byte encryption key
4. Encrypt new key with `CPF_CONFIG_MASTER_KEY`
5. Compute fingerprint and version metadata
6. Set previous current configuration to `isCurrent = false`
7. Insert new configuration with `isCurrent = true`
8. Commit transaction

### Versioning strategy

Recommended version format:

- `v1`, `v2`, `v3`, ...

Alternative accepted format:

- semantic timestamped labels such as `v2026-05-05-001`

The chosen strategy must remain unique and sortable enough for operators.

## API design

### `GET /api/cpf-encryption-config`

- Returns paginated public summaries

### `POST /api/cpf-encryption-config`

- Creates a configuration version
- Generates key material server-side
- Never accepts raw secret input from frontend

### `GET /api/cpf-encryption-config/current`

- Returns current public summary only

### `GET /api/cpf-encryption-config/[id]`

- Returns a public summary for one configuration

### `PUT /api/cpf-encryption-config/[id]`

- Updates safe metadata only

### `DELETE /api/cpf-encryption-config/[id]`

- Deletes a non-current configuration when permitted

### `POST /api/cpf-encryption-config/rotate`

- Generates a new encryption key version
- Makes the new row current
- Returns the new public summary

## Frontend design

### Components

- `src/components/cpf-encryption-config/cpf-encryption-config-list.tsx`
- `src/components/cpf-encryption-config/cpf-encryption-config-form.tsx`

### List component responsibilities

- Fetch paginated summaries
- Render current badge
- Render version, status, fingerprint preview, notes, timestamps
- Offer create, edit, and rotate actions

### Form component responsibilities

- Support create and edit flows for safe metadata
- Trigger create endpoint without collecting raw secrets
- Trigger rotate endpoint via explicit action
- Render friendly success and error states

### Forbidden frontend fields

Do not include in types, props, network payloads, or rendered markup:

- `keyCiphertext`
- decrypted key values
- `CPF_ENCRYPTION_ALGORITHM`
- `CPF_CONFIG_MASTER_KEY`
- any raw fingerprint if policy requires only masked preview

## Integration with CPF runtime encryption

### Read path

- Runtime encryption helpers request the current configuration from the service
- Service decrypts `key_ciphertext` using `CPF_CONFIG_MASTER_KEY`
- Returned key is used in `createCipheriv` and `createDecipheriv`

### Historical decrypt compatibility

- The encrypted CPF payload format should include configuration version metadata in a future-compatible way
- Recommended payload shape revision:

```text
configVersion:ivHex:authTagHex:ciphertextHex
```

This allows decryption using the specific historical configuration that encrypted the row.

If the current `v1:...` payload format is already in use, introduce a backward-compatible parser that can distinguish legacy payloads from configuration-versioned payloads.

## Validation and failure modes

- Fail fast if `CPF_CONFIG_MASTER_KEY` is missing or malformed
- Fail fast if there is no current configuration when encrypting new CPF values
- Reject attempts to create multiple current configurations outside the transactional rotation flow
- Reject public API attempts to submit or read secret-bearing fields

## Suggested implementation sequence

1. Add new schema table and migration
2. Add repository and service with paginated list
3. Add server-side key-protection helpers
4. Add rotation endpoint and transaction flow
5. Add public CRUD endpoints
6. Add reusable list and form components
7. Update CPF encryption runtime to resolve key from current configuration
8. Add backward-compatible decryption support if payload versioning changes

## Validation strategy

### Automated

- build: `npm run build`
- lint: `npm run lint`
- repository tests for pagination and single-current enforcement
- service tests for rotation and delete protections
- crypto tests for envelope encryption/decryption of persisted key material

### Manual

- create a configuration and verify it appears in paginated list
- rotate configuration and verify only one current row remains
- confirm browser payloads do not contain secret-bearing fields
- confirm deleting current configuration is blocked

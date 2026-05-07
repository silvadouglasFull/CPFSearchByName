# ADR 0022 - CPF Encryption Configuration Persistence and Rotation

## Status

Proposed

## Context

ADR 0021 defined server-side CPF encryption at rest using `AES-256-GCM`, plus keyed hash lookup for exact CPF search. The current implementation reads the CPF encryption key from environment variables.

That approach is acceptable for the first rollout, but it does not provide an operational model for:

- versioning encryption configurations,
- rotating the active encryption key without direct source-code edits,
- auditing which encryption configuration is currently active,
- managing future re-encryption migrations against historical rows.

The requested implementation adds a persisted encryption-configuration registry in PostgreSQL and management capabilities in the application.

There is also an important terminology correction:

- `CPF_ENCRYPTION_ALGORITHM = 'aes-256-gcm'` is a fixed algorithm identifier, not a secret value and not something that should be randomly generated.
- The generated sensitive value is the encryption key material compatible with that algorithm.

Because the key material will now be persisted in the database, storing it in plain text would create an unacceptable risk. Therefore the persisted key material must itself be protected with a separate server-only master key.

## Decision

1. Persist CPF encryption configurations in PostgreSQL

- Introduce a dedicated table for CPF encryption configurations.
- Each record represents one versioned configuration for CPF encryption.
- The table must support identifying exactly one current configuration.

2. Keep the algorithm fixed and server-side

- `CPF_ENCRYPTION_ALGORITHM` remains a backend constant with value `aes-256-gcm` in this phase.
- The UI must never receive the algorithm value.
- The UI must never receive the encryption key, decrypted key, encrypted key payload, or any derived secret that would allow CPF decryption.

3. Generate and rotate key material, not the algorithm string

- Rotation must generate a fresh 32-byte encryption key compatible with `AES-256-GCM`.
- Rotation creates a new configuration version and marks it as current.
- Previous configurations remain persisted for decryption compatibility and future re-encryption workflows, but are no longer current.

4. Protect persisted key material with envelope encryption

- The generated CPF encryption key must not be stored in plain text.
- The application must encrypt the generated key material using a separate server-only master key before persisting it.
- The master key remains environment-managed in this phase.
- Recommended variable name: `CPF_CONFIG_MASTER_KEY`.

5. Enforce a single current configuration in the database

- The schema must guarantee that at most one row can have `is_current = true`.
- This must be enforced with a database constraint or partial unique index, not only in application code.

6. Separate internal and public representations

- Repository and service layers may work with secret-bearing internal models on the server.
- API responses sent to the frontend must use a redacted/public DTO that excludes secret-bearing fields and excludes the algorithm identifier.

7. Add full management capabilities

- Provide CRUD and paginated listing at repository and service level.
- Provide UI components for listing configurations and creating or editing allowed metadata.
- The UI may create a new configuration version and trigger rotation, but it must not display secret values.

8. Keep hash-key management out of this slice

- `CPF_HASH_KEY` remains environment-managed for now.
- Hash-key persistence and rotation are not part of this implementation slice.

## Consequences

### Positive

- Encryption configuration lifecycle becomes explicit and auditable.
- The system gains an application-level rotation flow without exposing secrets to operators through the browser.
- Historical rows can remain decryptable because prior configurations remain versioned.
- The single-current constraint reduces ambiguity about which configuration is used for new writes.

### Negative

- Key management becomes more complex because the database now stores protected key material.
- Rotation now depends on both database state and a valid server-side master key.
- Public API contracts must be carefully designed to avoid accidental secret exposure.

### Mitigation

- Use envelope encryption with a dedicated master key.
- Use explicit public DTOs for frontend responses.
- Restrict destructive operations on current configurations.
- Add validation and fail-fast runtime checks for missing master-key configuration.

## Related ADRs

- ADR 0021 - CPF Encryption at Rest and Hash-Based Lookup

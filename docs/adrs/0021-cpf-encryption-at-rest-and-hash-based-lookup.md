# ADR 0021 - CPF Encryption at Rest and Hash-Based Lookup

## Status

Proposed

## Context

This application persists CPF values across multiple workflows, including collected portal records, generated candidates, search history, and HubDo audit trails. CPF is a sensitive personal identifier under LGPD, so storing it as plain text in PostgreSQL is not aligned with the security posture expected for production systems.

In the upstream reference implementation, the term `taxId` is equivalent to CPF. In this repository, CPF remains the domain term used in code, APIs, and UI.

The current stack is:

- Next.js 16 with server-side Node.js execution available for API routes and backend modules
- PostgreSQL with Drizzle ORM
- Existing CPF normalization and validation patterns already based on server-side utilities
- Product flows that sometimes need exact CPF lookup and, in some cases, partial CPF search

The main constraints are:

- Strong randomized encryption prevents direct equality queries on the encrypted column
- Plain SHA-256 is not sufficient as a search surrogate for CPF because the CPF space is small enough to be brute-forced offline
- Some existing features rely on partial CPF search, which is not directly compatible with strong at-rest encryption

## Decision

1. **Encrypt persisted CPF values at rest**
   - All new sensitive CPF fields stored for operational or audit purposes must be encrypted before being written to PostgreSQL.
   - The preferred implementation is Node.js native `node:crypto` using AES-256-GCM.
   - Encryption and decryption must run only on the server side.
   - Drizzle custom types will encapsulate the transformation so application code continues to work with plain normalized CPF strings while the database stores ciphertext.

2. **Normalize before validation, hashing, and encryption**
   - CPF must be normalized to digits only before any persistence step.
   - Validation remains mandatory at the application boundary.
   - This project should keep validation aligned with its existing server-side CPF utilities and `cpf-cnpj-validator` dependency.
   - If forms later adopt Zod-based schemas, `zod-brazil` may be added as a UI/input-layer convenience, but it is not the baseline persistence dependency for this ADR.

3. **Use a keyed hash column for exact lookup and indexing**
   - Every encrypted CPF field that needs equality lookup must have a companion hash column.
   - The hash must be a keyed HMAC, not raw SHA-256.
   - Recommended implementation: HMAC-SHA-256 over the normalized CPF using a dedicated secret key.
   - Queries such as exact match, uniqueness checks, and deduplication must use the hash column rather than the encrypted column.
   - The encrypted column is for secure storage and controlled read access only.

4. **Adopt a shared backend utility layer**
   - Create a small internal utility module for:
     - CPF normalization
     - CPF validation
     - encryption and decryption
     - keyed hash generation
     - optional CPF masking for UI output
   - This utility layer must be reused by Drizzle custom types, repositories, and migration backfills to avoid multiple crypto implementations in the codebase.

5. **Store ciphertext and hash separately in Drizzle schema**
   - The preferred schema pattern is:
     - encrypted CPF column using a Drizzle custom type or explicit encrypted text field
     - companion `cpfHash` column for exact search and indexing
   - Domain code may continue exposing `cpf`, but database storage must no longer rely on plain-text CPF columns for sensitive tables.
   - For repository APIs, equality queries must be rewritten from `eq(table.cpf, value)` to `eq(table.cpfHash, hashCpf(value))`.

6. **Scope the first rollout to exact-match and audit workflows**
   - Phase 1 applies to tables where CPF is retained for operational identity or audit purposes, especially `hubdo_cpf_lookups` and future user/payment-style identity tables.
   - Phase 1 does not promise immediate support for partial CPF search on encrypted values.
   - Existing partial-search datasets, such as features that search by CPF fragments, must be treated separately because randomized encryption and substring search are incompatible.

7. **Treat partial CPF search as a separate design problem**
   - Features that require partial CPF matching must not depend on decrypting whole datasets in application memory.
   - They also must not fall back to plain-text CPF storage just to preserve convenience.
   - Those flows require a separate indexed-search design, such as masked outputs plus derived search tokens, or another privacy-preserving indexing strategy, to be decided in a follow-up ADR.

8. **Use environment-managed secrets with rotation planning**
   - Introduce separate secrets for encryption and lookup hashing.
   - Example environment variables:
     - `CPF_ENCRYPTION_KEY`
     - `CPF_HASH_KEY`
   - Encryption keys must be 32-byte secrets suitable for AES-256-GCM.
   - The implementation must document a key rotation and re-encryption strategy before production rollout.

9. **Migrate with additive schema changes and backfill**
   - Existing plain-text CPF storage must be migrated in stages:
     - add encrypted and hash columns
     - backfill from existing normalized CPF values
     - switch reads and exact-match queries to the new columns
     - remove or deprecate plain-text reliance after verification
   - Backfill scripts must run server-side only and must never emit decrypted CPF values to logs.

## Consequences

**Positive:**

- Improves LGPD alignment for stored CPF data
- Reduces blast radius of database exposure by eliminating plain-text CPF storage in targeted tables
- Preserves exact-match lookup performance through indexed keyed hashes
- Keeps crypto concerns centralized instead of scattering manual encryption code through repositories
- Fits the current Next.js + Drizzle + Node.js runtime model without introducing unnecessary crypto dependencies

**Negative:**

- Adds migration complexity for existing tables and historical records
- Makes partial CPF search harder and forces explicit design choices for those features
- Introduces secret management and key rotation operational overhead
- Requires careful query refactoring because encrypted columns are no longer directly searchable

**Mitigation:**

- Roll out first on exact-match and audit tables before broader adoption
- Use keyed hashes for all equality search paths
- Keep crypto implementation in one shared server-side module
- Add masking helpers so UI can avoid exposing full CPF where not strictly necessary
- Write a follow-up ADR for privacy-preserving partial CPF search where the product still depends on substring matching

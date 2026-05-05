# Functional Specification - CPF Encryption Configuration Management

## Objective

Provide an administrative capability to manage persisted CPF encryption configurations, keeping exactly one configuration active for new CPF encryptions while never exposing encryption secrets or the backend algorithm identifier to the frontend.

## Scope

- Persist versioned CPF encryption configurations in PostgreSQL.
- Allow administrators to create, update, and list configurations.
- Allow generating a new encryption key compatible with the fixed backend algorithm and promoting the new configuration to current.
- Allow paginated listing of configurations.
- Provide reusable UI components for configuration list and configuration form.

## Out of Scope

- Exposing encryption keys, decrypted values, encrypted key payloads, or algorithm identifiers in browser responses.
- Rotating `CPF_HASH_KEY`.
- Automatic re-encryption of all historical CPF rows in the same delivery.

## User journeys

### 1. List configurations

1. User opens the encryption-configuration management screen.
2. System loads paginated configuration summaries.
3. User sees version, status, current flag, creation/update dates, and optional notes.
4. Secret-bearing values are never displayed.

### 2. Create a configuration version

1. User opens the create form.
2. User fills allowed metadata fields such as version label and notes.
3. User submits the form.
4. System generates a fresh backend encryption key compatible with the fixed algorithm.
5. System persists a new configuration version.
6. User receives success feedback.

### 3. Rotate current configuration

1. User clicks an action to generate a new current configuration.
2. System creates a new version with a newly generated encryption key.
3. System marks previous current configuration as non-current.
4. System marks the new version as current.
5. User sees the new current configuration in the list.

### 4. Edit a non-secret configuration field

1. User opens an existing configuration in edit mode.
2. User edits allowed metadata fields only.
3. User saves changes.
4. System persists the update without exposing or modifying secret-bearing values unless an explicit rotation action is requested.

## Business rules

- Exactly one configuration may be current at any time.
- The system must fail the write if a second current configuration would be created.
- The frontend may display only public metadata.
- The frontend must never receive:
  - encryption key material,
  - encrypted key payload,
  - algorithm identifier,
  - master-key identifiers,
  - any value that can decrypt CPF data.
- The backend algorithm remains fixed in this slice.
- Generating a “new algorithm value” is interpreted as generating new encryption key material compatible with the fixed algorithm.
- Deleting the current configuration is not allowed.
- Editing secret-bearing fields directly is not allowed.

## Functional requirements

### Data persisted per configuration

- Unique identifier
- Version label
- Current flag
- Configuration status
- Protected key payload stored server-side
- Key fingerprint or non-reversible identifier for audit/reference
- Notes or description
- Created/updated timestamps

### Supported operations

- Create configuration
- Read configuration by id
- Read current configuration
- Update allowed metadata
- List configurations with pagination
- Rotate current configuration by generating a new key version
- Soft-retire old non-current configurations when applicable

## UI requirements

### List component

- Show paginated configuration summaries.
- Highlight which record is current.
- Provide actions for create, edit metadata, and rotate.
- Never show secrets.

### Form component

- Support create mode and edit mode.
- Allow only metadata fields that are safe for frontend editing.
- Include explicit action for generating a new version instead of editing key material directly.
- Show success and error feedback.

## Acceptance criteria

- A configuration can be created and persisted in the database.
- A new rotation action creates a new version and makes it the only current configuration.
- The list endpoint returns paginated public summaries.
- No frontend response exposes the algorithm constant or secret-bearing fields.
- Attempts to delete the current configuration are rejected.
- Attempts to create two current configurations are blocked by backend logic and database constraint.

## Requirement traceability

1. Database schema

- `src/database/schema.ts`

2. Domain, repository, and service

- `src/cpfEncryptionConfig/domain/types.ts`
- `src/cpfEncryptionConfig/application/cpf-encryption-config.service.ts`
- `src/cpfEncryptionConfig/infrastructure/drizzle-cpf-encryption-config.repository.ts`

3. API

- `app/api/cpf-encryption-config/route.ts`
- `app/api/cpf-encryption-config/[id]/route.ts`
- `app/api/cpf-encryption-config/current/route.ts`
- `app/api/cpf-encryption-config/rotate/route.ts`

4. UI

- `src/components/cpf-encryption-config/cpf-encryption-config-list.tsx`
- `src/components/cpf-encryption-config/cpf-encryption-config-form.tsx`

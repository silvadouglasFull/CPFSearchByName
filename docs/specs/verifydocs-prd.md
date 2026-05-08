# Product Requirements Document (PRD) - verifyDocs

## Document Status

- Version: 1.0
- Language: English
- Source baseline: consolidated from accepted and proposed ADRs plus functional and technical specifications in `docs/adrs` and `docs/specs`

## Product Summary

verifyDocs is an anti-fraud investigation and CPF authenticity support platform designed to help people verify whether a provided CPF is likely legitimate, consistent, and traceable across trusted and semi-trusted data sources.

The product combines three complementary capabilities:

1. discovery of CPF-related records from public or operational data sources,
2. validation and corroboration of CPF identity signals through external providers,
3. secure persistence of search history and lookup evidence for later review.

The long-term goal is to make CPF verification workflows accessible to any person who needs to reduce fraud risk before interacting with an unknown identity. The current product scope already supports this vision through a web application, while preserving some operational and admin-oriented capabilities required by the existing system.

## Vision

Enable any user to investigate a CPF safely, quickly, and with enough evidence to reduce fraud exposure before making a decision.

## Problem Statement

People and operators often receive a CPF from a third party without enough context to determine whether it is authentic, consistent with the claimed identity, or worth trusting. Manual verification is fragmented, slow, and error-prone because it requires switching between multiple systems, handling partial information, and keeping a record of what was checked.

The core problems are:

- users may only have partial identity data, such as a name fragment, partial CPF, or phone number,
- public-source discovery and official validation happen in separate tools,
- lookup evidence is often not persisted in a structured, auditable way,
- sensitive CPF data creates privacy and operational risk if stored in plain text,
- official provider integrations have latency, cost, and reliability constraints that require workflow orchestration.

## Product Goal

Build a unified identity-verification workspace centered on CPF authenticity, where a user can:

- search and collect CPF candidates from a person name,
- filter and inspect collected results by partial CPF,
- generate candidate CPF combinations from partial information,
- validate a CPF against a more authoritative external source,
- use phone-based identity lookup as a corroborating signal,
- review the full history of previous investigations,
- trust that sensitive data is handled with appropriate security controls.

## Success Criteria

The product is successful when users can complete a CPF verification workflow end to end without leaving the application and can make a clearer fraud-risk decision based on the evidence returned.

Primary success indicators:

- users can move from unknown or partial identity data to a validated CPF investigation flow,
- official CPF validation is available when stronger evidence is needed,
- the application returns fast, understandable outcomes for search, queue, history, and verification states,
- search and lookup history can be revisited for audit and operational continuity,
- persisted CPF data exposure is reduced through encryption-at-rest and hash-based exact lookup where applicable.

## Target Users

### Primary users

- individuals trying to reduce fraud risk before trusting a provided CPF,
- analysts or operators performing identity checks during onboarding, payment, negotiation, or document review,
- support or back-office users who need repeatable verification workflows and history.

### Secondary users

- administrators who manage global application settings and provider-related configuration,
- technical operators monitoring asynchronous provider jobs, queues, and credit usage.

## User Needs

- I need to verify whether a CPF is plausible, consistent, and linked to the expected person.
- I need to work even when I only have partial data.
- I need a path from public-source discovery to stronger validation.
- I need previous searches and results to remain available.
- I need clear feedback when a search fails, returns no results, or requires another step.
- I need sensitive CPF data to be protected in storage.

## Product Principles

- Evidence over assumption: every verification step should return structured evidence, not only a binary answer.
- Progressive certainty: users can start from weak signals and move toward stronger validation.
- One application, multiple verification paths: search, generation, official lookup, and history should live in one workspace.
- Privacy by design: CPF persistence must move away from plain text wherever exact lookup allows it.
- Operational resilience: slow or costly providers should be handled asynchronously when required.

## Scope

### In scope

1. **Name-based CPF discovery**
   - Search by person name.
   - Collect portal results through browser automation and internal API interception.
   - Persist the collected result set.

2. **Partial CPF filtering**
   - Filter previously collected data by partial CPF.
   - Return matching records with friendly empty and error states.

3. **CPF candidate generation**
   - Generate valid CPF candidates from a partial CPF.
   - Support optional region/state digit filtering.

4. **Official CPF validation and enrichment**
   - Validate CPF and retrieve official person data through HubDo's Receita Federal-backed flow.
   - Support standard and turbo lookup modes.
   - Persist audit trail and credit usage.

5. **Phone-based corroboration**
   - Allow phone lookup through Credify APIs.
   - Use queue-first backend processing with real-time progress.
   - Persist provider responses and lookup history.

6. **History and evidence retention**
   - Persist histories for filter-by-CPF, generated CPF snapshots, and name-based searches.
   - Support paginated review and detail inspection.

7. **Configuration and administration**
   - Manage global app settings through a dedicated screen.
   - Support provider-related operational configuration.

8. **Security foundations for CPF storage**
   - Encrypt eligible CPF values at rest.
   - Support exact-match lookup using keyed hashes.

### Out of scope for this PRD baseline

- browser-side direct calls to external providers,
- legal certification or guarantee that a person is non-fraudulent,
- full privacy-preserving partial CPF search over encrypted data,
- PJ phone lookup flows,
- public consumer onboarding, pricing, or payment flows,
- file-import UI for bulk phone submission in the first Credify delivery.

## Key User Journeys

### Journey 1: Verify a CPF from a known name

1. User enters a person name.
2. System collects CPF-related records from the portal workflow.
3. User reviews the collected records.
4. User saves the result snapshot if needed.
5. User selects a candidate CPF for deeper verification.
6. System performs official lookup through HubDo.
7. User reviews official identity data and decides whether the CPF is trustworthy.

### Journey 2: Investigate a partial CPF

1. User enters a partial CPF.
2. System filters previously collected records.
3. If records exist, user inspects the results.
4. If stronger evidence is needed, user triggers official verification on a selected CPF.
5. User optionally saves the search results into history.

### Journey 3: Infer candidate CPFs from incomplete information

1. User enters a partial CPF.
2. User optionally selects a state/region digit.
3. System generates valid CPF candidates.
4. User reviews or saves the generated set.
5. User uses downstream verification steps for selected candidates.

### Journey 4: Corroborate identity from a phone number

1. User enters a Brazilian phone number.
2. System validates and normalizes the input.
3. System enqueues the lookup and returns a job ID immediately.
4. User watches real-time progress.
5. System returns success, not found, or error result with persisted history.
6. User uses the response as an additional anti-fraud signal.

### Journey 5: Review previous investigations

1. User opens a history tab or history view.
2. System lists previous saved searches and lookup events.
3. User inspects the saved result snapshot or provider response.
4. User reuses prior evidence without rerunning the entire investigation.

## Functional Requirements

### FR1. Name-based search

- The system must allow a user to submit a person name.
- The system must collect records using the existing portal-search workflow.
- The system must persist the full collected result set.
- The system must show result count, records, and friendly failure states.

### FR2. Partial CPF filtering

- The system must allow filtering by a normalized partial CPF between 1 and 9 digits.
- The system must reuse the existing business logic for filtering saved results.
- The system must return records, empty state, or actionable error state.

### FR3. CPF candidate generation

- The system must generate valid CPF candidates from a partial input.
- The system must optionally apply region/state digit filtering.
- The system must display the generated list, formatted CPF, and total count.

### FR4. Official CPF validation

- The system must support official CPF lookup through HubDo.
- The system must accept CPF and optional birth date.
- The system must support standard and turbo modes.
- The system must persist lookup status, response payload, timestamp, and credits consumed.

### FR5. Phone lookup corroboration

- The system must allow a user to submit a Brazilian phone number.
- The system must persist a job and queue item before provider processing.
- The system must process lookups through RabbitMQ-backed workers.
- The system must expose job progress and final item status.

### FR6. History management

- The system must persist and list history for filter-by-CPF searches.
- The system must persist and list history for generated CPF snapshots.
- The system must persist and list history for name-based search snapshots.
- The system must support pagination and latest-first ordering.

### FR7. Settings management

- The system must provide a page to view and edit global application settings.
- The system must persist setting updates and return the saved values as source of truth.

### FR8. Security controls for CPF persistence

- The system must encrypt eligible stored CPF values at rest.
- The system must use keyed HMAC hashes for exact-match CPF lookup.
- The system must centralize CPF normalization, validation, masking, hashing, encryption, and decryption.

## Non-Functional Requirements

### Reliability

- Asynchronous provider integrations must tolerate transient failures through bounded retries where appropriate.
- History and audit persistence must survive application restarts and user navigation changes.

### Security

- Provider credentials must remain server-side.
- Sensitive CPF values must not be logged in plain text.
- Encrypted CPF storage must use strong server-side cryptography.

### Performance

- User-facing enqueue actions should return quickly without waiting for long-running providers.
- Filtering and history listing should be responsive on desktop and mobile.

### Usability

- All user-facing flows must provide friendly validation, empty, success, and error states.
- The application must be responsive and usable on mobile and desktop.
- Navigation to major product areas must be discoverable from the home page and sidebar.

### Auditability

- Searches, generated outputs, and provider lookups must be reviewable after execution.
- Provider responses and status transitions must be persisted when defined by the related specification.

## Product Requirements by Capability Area

### 1. Discovery

The product must help users start from incomplete data. Name-based collection and partial-CPF filtering are foundational because many fraud checks begin without a confirmed full CPF.

### 2. Verification

The product must let users move from candidate discovery to stronger evidence. HubDo is the primary official-validation path in the current scope.

### 3. Corroboration

The product must support adjacent signals, such as phone-based identity lookup, when CPF-only verification is insufficient.

### 4. Traceability

The product must retain searchable histories and evidence snapshots so users can revisit prior investigations.

### 5. Safety

The product must reduce exposure of sensitive CPF values in persistence layers while preserving the exact-match lookup capability needed by operational workflows.

## Assumptions

- Users understand that public-source discovery is evidence-gathering, not final legal proof.
- External providers remain available and correctly configured with tokens, credentials, IP allowlists, queues, and database connectivity.
- The application remains primarily server-driven for sensitive operations.

## Dependencies

- Portal search workflow powered by browser automation.
- HubDo CPF WebService and related credit model.
- Credify APIs authentication and phone lookup endpoints.
- PostgreSQL with Drizzle-managed schema.
- RabbitMQ for queued lookup processing.
- Real-time event delivery for job progress.

## Risks and Mitigations

### Risk 1: External provider downtime or slowness

Mitigation:

- use queue-first orchestration where needed,
- apply retries only for transient failures,
- surface status clearly to users,
- persist results and transitions for later inspection.

### Risk 2: Sensitive CPF data leakage

Mitigation:

- adopt encryption at rest,
- use keyed HMAC for exact-match lookup,
- avoid logging normalized CPF values in plain text,
- centralize CPF protection utilities.

### Risk 3: Weak confidence from a single data source

Mitigation:

- combine discovery, official validation, and phone corroboration,
- preserve evidence history so users can compare signals.

### Risk 4: Product complexity for non-technical users

Mitigation:

- keep main flows page-based and guided,
- standardize friendly messages and clear statuses,
- consolidate navigation in home and sidebar surfaces.

## Success Metrics

Recommended product metrics for ongoing tracking:

- completion rate for name-to-verification journey,
- percentage of investigations that proceed from discovery to official lookup,
- median time from user submission to first meaningful result,
- ratio of successful versus failed provider lookups,
- history reuse rate,
- percentage of eligible CPF-bearing tables migrated away from plain-text storage.

## Release Approach

### Current baseline

- Next.js web application is the primary execution channel.
- Legacy CLI compatibility may remain temporarily for operational continuity.

### Suggested phased rollout

1. Discovery and generation flows
2. History and evidence retention
3. Official CPF validation via HubDo
4. Phone corroboration via Credify queue flow
5. Security hardening for CPF persistence and future privacy upgrades

## Open Questions

- What level of simplification is needed before the product can be positioned for a broad consumer audience rather than operational users?
- Which verification outcome should be presented as the primary trust recommendation to users when multiple signals disagree?
- How should privacy-preserving partial CPF search evolve after exact-match encryption rollout?
- What fraud-decision heuristics, if any, should be added on top of raw evidence in a future phase?

## Product Definition Summary

verifyDocs is a CPF-centered anti-fraud product. It helps users move from uncertain identity data to actionable evidence through search, filtering, candidate generation, official validation, phone-based corroboration, secure persistence, and investigation history. Its value is not only in returning data, but in structuring a repeatable decision workflow around CPF authenticity and fraud-risk reduction.

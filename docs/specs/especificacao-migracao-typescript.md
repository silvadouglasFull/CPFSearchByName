# TypeScript Migration and Adoption Specification

## Objective

Standardize how new features are created on Next.js infrastructure and how legacy modules are migrated to TypeScript with low risk.

## Adoption strategy

### New features

- Must be exposed first through `app/**` (App Router / Route Handlers / pages).
- Must consume TypeScript services in `src/<context>/...`.
- Must expose typed contracts for reuse by other modules.
- May keep CLI adapters only as temporary compatibility bridges.

### Legacy flows

- Migrate in stages:
  1. Extract business rules into TypeScript modules.
  2. Create service classes and contract interfaces.
  3. Isolate infrastructure and separate framework boundaries.
  4. Publish the primary entrypoint through Next.js (`app/**`).
  5. Keep legacy entrypoints as adapters until migration is complete.
  6. Remove adapters when all consumers are updated.

## Conventions

- Use absolute imports via project alias.
- Centralize types and contracts in `domain/types.ts` when applicable.
- Keep domain errors in dedicated modules.
- Keep rule constants in dedicated constants files.
- Keep framework boundaries in `app/**`, without business rule coupling.

## Definition of Done (DoD)

- TypeScript build runs without errors.
- Next.js entrypoint (page/handler) delegates to application service.
- Infrastructure modules contain no business rules.
- Services depend on abstractions/interfaces.
- Corresponding ADR/spec documentation is created or updated.
- If a legacy CLI exists, it must act only as a compatibility adapter.

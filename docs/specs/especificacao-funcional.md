# Functional Specification - verifyDocs

## Objective

Provide the CPF lookup and candidate generation workflow in a Next.js 16 application while preserving compatibility with the current operational flow.

## Scope

- Collect search results by name and save them as JSON.
- Filter saved results by partial CPF.
- Generate CPF candidates from a provided partial segment.
- Apply regional digit filtering based on the provided state code (UF).
- Expose new features primarily through Next.js infrastructure (App Router and Route Handlers).
- Keep the legacy CLI flow only as temporary compatibility.

## Main flow

1. The user provides a name to search.
2. The system collects records and writes `resultados_portal.json`.
3. The user provides a partial CPF.
4. The system filters results by partial CPF.
5. If no match is found, the flow stops with a user-facing message.
6. The user provides the state code (2 letters).
7. The system resolves the region digit using `identifyByState.json`.
8. The system generates CPF candidates and displays/saves the output.

## Execution channels

- Primary channel: Next.js 16 routes and handlers.
- Secondary (legacy) channel: CLI execution for operational continuity.

## Inputs

- Person name (free text).
- Partial CPF (digits or masked input).
- State code (2-letter abbreviation).

## Outputs

- `resultados_portal.json`: list of records collected from the portal.
- `generated_cpfs.json`: list of generated CPF candidates.
- Terminal output with status messages and summaries.
- HTTP responses when the flow is exposed through Route Handlers.

## Business rules

- Partial CPF must contain 1 to 9 digits after normalization.
- State code (UF) must contain exactly two letters.
- If the partial CPF is not found in collected results, candidate generation must not run.
- If state code is invalid, the process must fail with a clear message.

## Acceptance criteria

- Execute the full flow via Next.js endpoint/route with valid input.
- With a non-existing partial CPF, the process must stop before generation.
- With a valid state code, generation must apply the corresponding region digit.
- `generated_cpfs.json` must be created when running generation.
- Every new feature must be published first in Next.js infrastructure, according to ADR 0005.

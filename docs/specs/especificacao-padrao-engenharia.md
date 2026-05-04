# Engineering Standard Specification

## Objective

Define the mandatory standard for creating and evolving the project on Next.js infrastructure, with focus on TypeScript, Clean Code, SOLID, modularization, and object-oriented design.

## Scope

Applies to:

- Every new development in the project.
- Every structural refactor of existing modules.
- New domain, application, infrastructure, and entrypoint interface modules.
- Next.js App Router and Route Handler files.

## Mandatory requirements

### 1. Language

- TypeScript implementation is mandatory.
- Explicit typing is required for public functions, classes, interfaces, and contracts.

### 2. Modular structure

- Minimum responsibility separation:
  - `domain`: types, entities, rules, and validations.
  - `application`: use cases/application services.
  - `infrastructure`: file, network, and external dependency access.
  - `interfaces`: `app/**` (pages/layouts/route handlers) and legacy `cli` when applicable.

### 2.1. Next.js boundary

- `app/**` must only contain framework boundary concerns (UI, handlers, flow composition).
- Business rules must not be directly coupled to components/handlers.
- Route Handlers must delegate to application services.

### 3. Function responsibility

- Each function must have a single primary responsibility.
- Long functions must be split into well-named helper functions.

### 4. Class usage

- Use cases and application services must be encapsulated in classes.
- Dependencies should be injected through constructors whenever possible.

### 5. Clean Code

- Use self-explanatory names for classes, methods, functions, and variables.
- Avoid redundant comments; prefer clear code.
- Avoid logic duplication.
- Handle errors with clear operator-oriented messages.

### 6. SOLID

- SRP: each module/class has one primary responsibility.
- OCP: changes by extension of modules, avoiding cascade edits.
- LSP: implementations must respect interface contracts.
- ISP: interfaces must be small and cohesive.
- DIP: application services depend on abstractions, not concretions.

### 7. Magic numbers

- Relevant fixed values must be extracted to named constants.
- Constants must live in domain/config modules according to context.

## Acceptance criteria

- New code compiles with `npm run build`.
- Layered structure is present and aligned with responsibilities.
- Business rules are outside `app/**` and CLI files.
- External dependencies are isolated in infrastructure modules.
- No magic numbers in core rules without named constants.
- New functionality is exposed primarily through App Router/Route Handlers.

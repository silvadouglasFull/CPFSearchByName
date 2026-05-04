# ADR 0004 - Mandatory TypeScript Engineering Standard (Next.js Context)

## Status

Accepted

## Context

The project is now running on Next.js 16 and includes both web application layers and domain services inherited from previous CLI workflows.
To avoid architectural drift, engineering standards must remain mandatory and compatible with Next.js App Router conventions.

## Decision

All new business logic and integration code must follow this baseline:

- Mandatory language: TypeScript.
- Responsibility-based modularization (domain, application, infrastructure, interfaces/entrypoints).
- Functions and classes with single responsibility.
- Clean Code and SOLID principles.
- Explicit contracts with interfaces and domain types.
- Constants extracted to avoid magic numbers.

## Mandatory Guidelines

- Do not introduce new business rules in plain JavaScript.
- Keep framework boundary concerns (route handlers, server actions, pages, layouts) separated from core domain services.
- Keep network, filesystem, and external integrations isolated in infrastructure modules.
- Keep web entrypoints thin and delegate business flow to services.

## Relationship with Infrastructure ADR

- ADR 0005 defines the mandatory Next.js infrastructure pattern.
- ADR 0004 remains the mandatory engineering style inside that infrastructure.

## Consequences

- Better maintainability and testability in a web-first architecture.
- Reduced coupling between Next.js framework code and domain rules.
- Higher consistency across legacy service modules and new App Router features.

## Supersedes

- Supersedes the previous script-only interpretation of ADR 0004.

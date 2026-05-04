# Technical Specification - verifyDocs

## Overview

Project with Next.js 16 (App Router) as the infrastructure standard, while preserving reusable domain modules for CPF data collection, filtering, and candidate generation.

## Base architecture

- Web infrastructure: Next.js 16 with App Router.
- Domain/application layer: TypeScript modules in `src/**`.
- External integrations (network/file): isolated infrastructure modules.
- Primary entrypoint for new features: `app/**` (pages/layouts/route handlers).
- Legacy CLI flow: temporarily allowed for compatibility.

## Functional components

- Name-based collection
  - Responsibility: collect records by name from the portal.
  - Strategy: Puppeteer + internal search API response interception.
  - Output: `resultados_portal.json`.

- Partial CPF filtering
  - Responsibility: filter `resultados_portal.json` by partial CPF.

- Candidate generation
  - Responsibility: generate valid CPFs from a partial segment.
  - Rules: check-digit calculation and validation using `cpf-cnpj-validator`.
  - Additional support: optional region-digit filtering.
  - Output: `generated_cpfs.json`.

- Regional mapping
  - `identifyByState.json`: mapping from region digit to Brazilian states.

## Data contracts

### Collected record (`resultados_portal.json`)

```json
{
  "nome": "string",
  "cpf": "string",
  "vinculo": "string",
  "linkDetalhes": "string",
  "paginaOrigem": 1
}
```

### Generated CPF (`generated_cpfs.json`)

```json
{
  "cpf": "string",
  "formattedCpf": "string",
  "baseNineDigits": "string"
}
```

Note: the current generation output file is `generated_cpfs.json`.

## Dependencies

- `puppeteer`
- `cpf-cnpj-validator`

## Execution

### Standard infrastructure commands

- Web development: `npm run dev`
- Web build: `npm run build`
- Web production runtime: `npm run start`

### Legacy compatibility commands

- Build legacy TypeScript modules: `npm run node-build`
- Run legacy CLI routines only when operationally required.

## Error handling

- Missing required input must return contextual errors (CLI or HTTP).
- Invalid or unmapped state code must stop the flow.
- Scraping/network failures must be logged with step-level context.
- Endpoints in `app/**/route.ts` must return HTTP status codes consistent with error type.

## Mandatory evolution guideline

- Every new technical feature must be created in Next.js infrastructure first (App Router and Route Handlers), according to ADR 0005.
- Legacy modules must not be expanded as the primary delivery channel.

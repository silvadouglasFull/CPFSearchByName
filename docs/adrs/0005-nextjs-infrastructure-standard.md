# ADR 0005 - Next.js 16 Infrastructure Standard

## Status

Accepted

## Context

The project adopted Next.js 16 (`next`, `react`, `react-dom`) and now has a web application runtime with App Router conventions.
Previous architecture emphasized standalone scripts. Without a formal infrastructure ADR, project organization can become inconsistent across app routes, API endpoints, environment handling, and build/runtime commands.

This ADR is based on the official docs shipped in `node_modules/next/dist/docs/`, mainly:

- `01-app/01-getting-started/02-project-structure.md`
- `01-app/01-getting-started/03-layouts-and-pages.md`
- `01-app/01-getting-started/15-route-handlers.md`
- `01-app/03-api-reference/03-file-conventions/src-folder.md`
- `01-app/02-guides/environment-variables.md`
- `01-app/02-guides/upgrading/version-16.md`

## Decision

The project must follow the infrastructure pattern below.

1. Router and app structure

- App Router is the default routing standard.
- Use `app/` (or `src/app/`), with `layout.tsx` and `page.tsx` conventions.
- Do not mix active routing roots (`app/` and `src/app/`) at the same time.

2. API and backend-for-frontend entrypoints

- New HTTP endpoints must be implemented with Route Handlers (`route.ts`) inside App Router segments.
- Do not use legacy Pages Router API routes for new features.

3. Folder boundaries

- Framework files stay in App Router folders (`app/**`).
- Domain and reusable modules stay in `src/**`.
- Static assets stay in `public/` at repository root.
- Project config files remain in root (`package.json`, `next.config.ts`, `tsconfig.json`, `.env*`).

4. Environment variable policy

- `.env*` files are loaded from repository root.
- Client-exposed variables must use `NEXT_PUBLIC_` prefix.
- Server-only secrets must never be exposed to client bundles.

5. Runtime and build

- Use Next.js scripts as canonical app lifecycle commands:
  - `dev`: `next dev`
  - `build`: `next build`
  - `start`: `next start`
- Keep Turbopack as default for Next.js 16 unless explicitly justified.
- Keep TypeScript and Node runtime compatible with Next.js 16 requirements.

6. Legacy scripts migration rule

- Existing CLI workflows may remain temporarily for backward compatibility.
- New features must be exposed through Next.js infrastructure first (pages, components, route handlers, server actions).

## Consequences

- Single infrastructure standard for all future development.
- Clear separation between framework layer (Next.js) and business services.
- Easier onboarding and lower risk of architectural divergence.
- Gradual migration path for legacy script-based flows without blocking delivery.

## Supersedes

- Supersedes script-first infrastructure assumptions in older ADRs.
- Does not invalidate domain decisions from ADR 0001, 0002, and 0003.

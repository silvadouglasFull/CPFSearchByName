# Technical Specification - User Scoped App Settings Persistence

## Overview

Evoluir o modelo de `app_settings` de singleton global para singleton por usuario autenticado, com foreign key para `authenticated_users` e propagacao de `authenticatedUserId` pelo fluxo de autenticacao/middleware.

## Data model changes

Table: `app_settings`

### Additions

- `authenticated_user_id` (uuid, fk -> `authenticated_users.id`, on delete cascade)

### Constraint changes

- Remover unique global em `singleton_key`.
- Criar unique composto em (`authenticated_user_id`, `singleton_key`).
- Criar indice em `authenticated_user_id`.

## Migration

Gerada por Drizzle:

- `drizzle/0015_white_morbius.sql`

Operacoes SQL:

1. Drop da constraint `app_settings_singleton_key_unique`.
2. Add coluna `authenticated_user_id`.
3. Add FK para `authenticated_users(id)`.
4. Create index `app_settings_auth_user_id_idx`.
5. Create unique index `app_settings_user_singleton_uidx`.

## Domain and contracts

### AppSettings type

Adicionar campo:

- `authenticatedUserId: string | null`

### Repository contract

- `getGlobal(authenticatedUserId: string): Promise<AppSettings | null>`
- `upsertGlobal(authenticatedUserId: string, settings: Partial<AppSettingsFields>): Promise<AppSettings>`

### Service contract

- `getSettings(authenticatedUserId?: string): Promise<AppSettings>`
- `updateSettings(authenticatedUserId: string | undefined, updates: Partial<AppSettingsFields>): Promise<AppSettings>`

Regras:

1. Service deve validar `authenticatedUserId` e falhar sem id.
2. Upsert deve incluir `authenticatedUserId` no insert.
3. Conflito de upsert deve usar chave composta (`authenticated_user_id`, `singleton_key`).

## Runtime propagation

### Auth callback

Arquivo: `src/auth/auth-options.ts`

1. Persistir/consultar usuario autenticado.
2. Injetar `authenticatedUserId` no JWT (`token.authenticatedUserId`).

### Proxy middleware

Arquivo: `proxy.ts`

1. Ler JWT via `getToken`.
2. Encaminhar header `x-authenticated-user-id` para as rotas internas quando disponivel.

### API route

Arquivo: `app/api/app-settings/route.ts`

1. Ler `x-authenticated-user-id` da requisicao.
2. Retornar `401` sem id.
3. Chamar service passando `authenticatedUserId`.

## Affected files

1. `src/database/schema.ts`
2. `drizzle/0015_white_morbius.sql`
3. `src/appSettings/domain/types.ts`
4. `src/appSettings/application/app-settings.service.ts`
5. `src/appSettings/infrastructure/drizzle-app-settings.repository.ts`
6. `src/auth/auth-options.ts`
7. `proxy.ts`
8. `app/api/app-settings/route.ts`

## Validation plan

1. Schema

- Confirmar existencia da coluna `authenticated_user_id` em `app_settings`.
- Confirmar FK e indexes criados.

2. API

- GET/PUT em `/api/app-settings` com header valido retornam 200.
- GET/PUT sem header retornam 401.

3. Isolation

- Usuarios distintos mantem linhas de settings distintas para `singleton_key=global`.

4. Backward behavior

- Fluxos sem usuario continuam com fallback para defaults apenas onde ja existe tratamento de erro no codigo de runtime.

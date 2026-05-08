# ADR 0037: App Settings Escopadas por Usuario Autenticado

## Status

Proposed

## Date

2026-05-08

## Context

A aplicacao passou a ter autenticacao Google OAuth2 e persistencia minima de usuarios autenticados em `authenticated_users`.

O modelo atual de `app_settings` e singleton global (`singleton_key` unico), o que impede personalizacao por usuario autenticado.

Para garantir isolamento de configuracoes por usuario, as preferencias de aplicacao precisam ser vinculadas ao usuario logado.

## Decision

Alterar `app_settings` para suportar configuracao singleton por usuario autenticado, com associacao por foreign key para `authenticated_users`.

### Decision details

1. Adicionar coluna `authenticated_user_id` em `app_settings`.
2. Criar foreign key `app_settings.authenticated_user_id -> authenticated_users.id`.
3. Substituir unicidade global de `singleton_key` por unicidade composta:

- (`authenticated_user_id`, `singleton_key`)

4. Ajustar repository para leitura/escrita por `authenticated_user_id`.
5. Ajustar service para exigir `authenticated_user_id` em operacoes de settings.
6. Ajustar rotas de API para receber o id do usuario autenticado via middleware/proxy.

## Options considered

### Option A: Singleton por usuario com FK para authenticated_users ✅ Chosen

Pros:

- Isolamento correto de configuracoes por usuario.
- Mantem padrao singleton com chave `global`, agora por usuario.
- Permite auditoria e evolucao futura com ownership claro.

Cons:

- Exige mudanca de schema e contrato de service/repository.
- Sessao precisa propagar id interno de usuario no contexto da requisicao.

### Option B: Manter singleton global ❌ Rejected

Pros:

- Sem mudanca de schema.

Cons:

- Nao atende requisito de configuracoes associadas ao usuario autenticado.
- Risco de sobrescrita entre usuarios.

## Consequences

### Positive

1. Cada usuario autenticado passa a ter sua propria configuracao global.
2. Regras de acesso ficam alinhadas com ownership de dados.
3. API de settings passa a operar com contexto de usuario.

### Negative

1. Requer migracao de banco e ajuste de chamadas existentes.
2. Fluxos sem contexto de usuario precisam fallback para defaults em memoria.

### Mitigations

1. Manter `DEFAULT_APP_SETTINGS` como fallback quando operacao sem usuario for necessaria.
2. Retornar `401` em endpoints protegidos quando header de usuario nao estiver presente.

## Implementation constraints

1. `app_settings` deve conter FK valida para `authenticated_users`.
2. Nao permitir retorno de configuracao global sem contexto de usuario nas APIs protegidas.
3. Repository de settings deve consultar por (`authenticated_user_id`, `singleton_key`).
4. Proxy/middleware deve propagar `x-authenticated-user-id` para as rotas privadas.

## Validation strategy

1. Usuario A e Usuario B leem e atualizam settings sem interferencia entre si.
2. API de app settings sem header de usuario retorna `401`.
3. Upsert por usuario reutiliza mesma linha `singleton_key=global` para aquele usuario.
4. FK impede associacao de settings a usuario inexistente.

## Related references

- ADR 0035: Escopos Google OAuth para Login com NextAuth
- ADR 0036: Persistencia de Usuario Autenticado e Protecao de Rotas Privadas
- docs/specs/user-scoped-app-settings-functional-spec.md
- docs/specs/user-scoped-app-settings-technical-spec.md

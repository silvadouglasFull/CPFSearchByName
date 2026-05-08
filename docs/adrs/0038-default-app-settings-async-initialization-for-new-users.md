# ADR 0038: Default App Settings Async Initialization for New Authenticated Users

## Status

Proposed

## Date

2026-05-08

## Context

Com a mudança para app settings escopo por usuário (ADR 0037), cada usuario autenticado precisa ter uma linha de configuracoes no banco.

Atualmente, o fluxo de autenticacao OAuth2 persiste o usuario mas nao inicializa suas settings. Isso resulta em erro `401` ou fallback para defaults em memoria quando o usuario tenta acessar endpoints que consultam settings.

Idealmente, as settings devem ser criadas automaticamente no signin de novo usuario. Porem, se esse processo bloquear o fluxo de login, aumenta latencia na autenticacao e piora UX.

## Decision

Inicializar DEFAULT_APP_SETTINGS de forma assíncrona (não-bloqueante) após sucesso de signIn, disparando a criacao em background sem aguardar conclusao.

### Decision details

1. No callback de autenticacao (signIn ou jwt), apos persistir usuario autenticado com sucesso, disparar criacao de DEFAULT_APP_SETTINGS sem await.
2. A criacao das settings ocorre em paralelo com finalizacao do fluxo de autenticacao.
3. Erros na criacao das settings nao bloqueiam retorno de sessao valida.
4. Erros sao registrados em log para diagnostico, mas nao propagam para usuario.
5. Se settings ja existem para o usuario, operacao e idempotente (upsert existente).

## Options considered

### Option A: Async init sem bloqueio no signin ✅ Chosen

Pros:

- Fluxo de login rapido e sem latencia adicional.
- Settings criadas em background para novo usuario.
- Melhor UX.
- Falhas isoladas e tratadas graciosamente.

Cons:

- Pequena janela de tempo onde usuario tem sessao mas ainda nao tem settings no banco.
- Requer tratamento de erro isolado para operacao background.

### Option B: Await criacao de settings no signin ❌ Rejected

Pros:

- Garantia de settings existentes imediatamente apos login.

Cons:

- Adiciona latencia ao login.
- Falha na criacao de settings bloqueia login inteiro.
- Pior UX.

## Consequences

### Positive

1. Login rapido sem latencia de persistencia de settings.
2. Settings criadas automaticamente para novo usuario.
3. Codigo de aplicacao continua funcionando com fallback para defaults se necessario.

### Negative

1. Pequena janela de race condition onde usuario autenticado nao tem settings no banco ainda.
2. Falhas silenciosas se erro na criacao de settings.

### Mitigations

1. APIs de settings ja possuem fallback para DEFAULT_APP_SETTINGS em catch.
2. Logs de erro registram qualquer falha na inicializacao de settings.
3. Operacao de upsert e idempotente, segura para retry.

## Implementation constraints

1. Nao usar `await` na chamada de criacao de settings no signin.
2. Tratar erros isoladamente, sem propagacao.
3. Registrar erros em log para observabilidade.
4. Usar `Promise.resolve()` ou disparar sem aguardar conclusao.

## Validation strategy

1. Usuario faz login, sessao retorna imediatamente.
2. Segundos apos, settings do usuario existem no banco.
3. API de settings retorna configuracoes do usuario sem fallback.
4. Falha proposital na criacao de settings nao bloqueia sessao.
5. Log registra tentativa de criacao para auditoria.

## Related references

- ADR 0036: Persistencia de Usuario Autenticado e Protecao de Rotas Privadas
- ADR 0037: App Settings Escopadas por Usuario Autenticado
- docs/specs/default-app-settings-async-initialization-functional-spec.md
- docs/specs/default-app-settings-async-initialization-technical-spec.md

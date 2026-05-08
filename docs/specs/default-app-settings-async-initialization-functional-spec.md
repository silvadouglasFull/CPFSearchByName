# Functional Specification - Default App Settings Async Initialization

## Objective

Garantir que todo novo usuario autenticado via OAuth2 tenha automaticamente suas configuracoes padrao criadas no banco, sem bloquear o fluxo de autenticacao.

## Scope

### Includes

1. Criacao automatica de DEFAULT_APP_SETTINGS para novo usuario apos autenticacao sucesso.
2. Operacao nao-bloqueante (assíncrona, sem await).
3. Tratamento de erro isolado para operacao de inicializacao.
4. Log de tentativas e falhas para diagnostico.

### Excludes

1. Tela ou fluxo customizado de configuracoes iniciais.
2. Permissao de usuario para alterar defaults no signin.
3. Migracoes de settings de usuario anterior ou legado.

## Functional requirements

### FR-01 - Auto-inicializacao de settings

Ao concluir autenticacao com sucesso, o sistema deve inicializar DEFAULT_APP_SETTINGS para o usuario autenticado, disparando a operacao sem bloqueio.

### FR-02 - Nao-bloqueante

A inicializacao de settings nao deve atrasar o retorno de sessao valida.

### FR-03 - Idempotente

Se settings ja existem para usuario, operacao continua sem erro (upsert).

### FR-04 - Erro isolado

Falha na criacao de settings nao deve impedir retorno de sessao valida.

### FR-05 - Observabilidade

Tentativas de inicializacao devem ser registradas em log para auditoria e diagnostico.

## Business rules

1. Toda novo usuario recebe DEFAULT_APP_SETTINGS automaticamente.
2. O usuario nao precisa fazer nada adicional apos login para ter settings.
3. Operacao ocorre sempre apos signIn bem-sucedido.
4. Erros em background nao afetam experiencia do usuario.

## Acceptance criteria

1. Novo usuario faz login com Google, sessao retorna rapidamente.
2. Segundos apos, usuario consegue acessar `/api/app-settings` e recebe suas configuracoes.
3. Falha na criacao de settings nao impede login.
4. Log registra inicializacao bem-sucedida e falhas com detalhes.
5. Usuario B pode fazer login em paralelo sem interferencia com inicializacao de Usuario A.

## Traceability

1. Auth callback: `src/auth/auth-options.ts`
2. App Settings Service: `src/appSettings/application/app-settings.service.ts`
3. Logging: console.error/console.info para diagnostico

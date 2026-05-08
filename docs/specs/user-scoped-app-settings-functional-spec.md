# Functional Specification - User Scoped App Settings

## Objective

Associar as configuracoes da aplicacao ao usuario autenticado, garantindo isolamento por usuario nas operacoes de leitura e atualizacao de settings.

## Scope

### Includes

1. Persistencia de settings por usuario autenticado.
2. Associacao de `app_settings` com `authenticated_users`.
3. Leitura e atualizacao de settings via API usando contexto do usuario logado.
4. Comportamento de erro para requisicoes sem usuario autenticado no contexto.

### Excludes

1. Tela administrativa para listar settings de outros usuarios.
2. Compartilhamento de settings entre usuarios.
3. Alteracao de fluxo de login Google alem da propagacao do id interno.

## Functional requirements

### FR-01 - Settings por usuario

O sistema deve manter uma configuracao `global` independente para cada usuario autenticado.

### FR-02 - Leitura por usuario logado

Ao consultar `/api/app-settings`, o sistema deve retornar apenas as configuracoes do usuario autenticado da requisicao.

### FR-03 - Atualizacao por usuario logado

Ao atualizar `/api/app-settings`, o sistema deve aplicar mudancas apenas na configuracao do usuario autenticado da requisicao.

### FR-04 - Nao autenticado

Se a requisicao chegar sem `authenticated user id` propagado pelo middleware/proxy, a API deve responder `401 Unauthorized`.

### FR-05 - Isolamento

Alteracoes de settings realizadas por um usuario nao podem impactar settings de outro usuario.

## Business rules

1. A chave funcional de singleton continua `singleton_key=global`, mas agora por usuario.
2. O id do usuario autenticado deve vir do contexto de autenticacao da requisicao.
3. O endpoint de app settings nao deve operar com contexto anonimo.

## Acceptance criteria

1. Dado usuario autenticado com id valido, GET de `/api/app-settings` retorna settings daquele usuario.
2. Dado usuario autenticado com id valido, PUT de `/api/app-settings` atualiza settings daquele usuario.
3. Dado dois usuarios distintos, updates de um nao alteram leitura do outro.
4. Dada requisicao sem id de usuario no contexto, API retorna `401`.

## Traceability

1. API route: `app/api/app-settings/route.ts`
2. Service: `src/appSettings/application/app-settings.service.ts`
3. Repository: `src/appSettings/infrastructure/drizzle-app-settings.repository.ts`
4. Proxy: `proxy.ts`
5. Auth callbacks: `src/auth/auth-options.ts`

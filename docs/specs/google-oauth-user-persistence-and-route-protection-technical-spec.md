# Technical Specification - Persistencia de Usuario Google OAuth e Middleware de Rotas Privadas

## Visao geral

Esta especificacao complementar define a arquitetura tecnica para persistencia de usuario autenticado via Google OAuth2, leitura do proprio perfil e protecao de rotas privadas por middleware.

## Objetivos tecnicos

1. Persistir usuario autenticado em tabela dedicada com schema minimo.
2. Definir repository e service para salvar e consultar o proprio usuario.
3. Expor dados do proprio perfil para componente de visualizacao.
4. Bloquear acesso nao autenticado a rotas privadas via middleware.
5. Manter apenas landing pages como publicas.

## Modelo de dados

### Tabela

Nome recomendado: authenticated_users

### Colunas obrigatorias

1. id: uuid, primary key
2. name: text, not null
3. profile_picture: text, nullable
4. email: text, not null, unique

### Restricoes

1. unique(email) para evitar duplicidade por identidade Google.
2. Nenhuma coluna de senha.

## Fluxo tecnico de persistencia

1. Usuario conclui OAuth2 Google com sucesso.
2. Camada de autenticacao obtem profile basico (name, email, picture).
3. Service de perfil de usuario executa upsert por email.
4. Repository persiste no banco:
- se email nao existir: insert com id uuid
- se email existir: update de name e profile_picture
5. Sessao segue autenticada no app.

## Camadas

### Repository

Responsabilidade:

- Persistir usuario por upsert de email.
- Buscar usuario por email (ou id da sessao quando aplicavel).

Operacoes previstas:

1. upsertFromGoogleProfile(input)
2. findByEmail(email)

Operacoes proibidas:

1. listAllUsers()
2. qualquer forma de listagem/paginacao de usuarios

### Service

Responsabilidade:

- Aplicar regras de negocio de persistencia do usuario autenticado.
- Fornecer dados do proprio usuario para UI.

Operacoes previstas:

1. persistAuthenticatedUser(profile)
2. getCurrentUserProfile(session)

Regras:

1. Falhar se email nao estiver presente no retorno OAuth.
2. Nunca manipular senha.
3. Nunca expor listagem de usuarios.

## Componente de visualizacao do proprio usuario

Nome sugerido: UserProfileCard

Responsabilidade:

- Exibir nome, email e foto de perfil do usuario autenticado.
- Mostrar estado de carregamento/ausencia de sessao.

Dados exibidos:

1. name
2. email
3. profile_picture

Restricoes:

1. Sem selecao de outros usuarios.
2. Sem listagem.

## Middleware de protecao

### Objetivo

Restringir acesso a rotas privadas para usuarios autenticados.

### Rotas privadas

1. /api/*
2. /filter-by-cpf
3. /filter-by-cpf/*
4. /app-settings
5. /app-settings/*
6. /generator-cpf
7. /generator-cpf/*
8. /get-cpfs-by-name
9. /get-cpfs-by-name/*
10. /hubdo-cpf-lookup
11. /hubdo-cpf-lookup/*

### Rotas publicas

1. /
2. /privacy-policy
3. /terms-of-use
4. /contact

### Regra de bloqueio

Se nao houver sessao valida:

1. Requisicao para rota privada de pagina: redirecionar para login.
2. Requisicao para /api/*: retornar 401 (ou redirecionar conforme politica global do projeto).

## Seguranca e privacidade

1. Sem senha local.
2. Menor privilegio em OAuth mantido por ADR 0035.
3. Persistir somente campos definidos nesta spec.
4. Nao expor endpoint de listagem de usuarios.

## Tratamento de erros

1. Sem email no callback OAuth: nao persistir, encerrar fluxo autenticado.
2. Falha de banco no upsert: impedir sessao final de negocio ou registrar erro conforme estrategia do projeto.
3. Usuario autenticado sem registro local: service deve tentar persistencia idempotente.

## Validacao tecnica

1. Login Google persiste usuario com campos obrigatorios.
2. Relogin do mesmo email atualiza name/profile_picture sem duplicar.
3. Sem tabela/campo de senha.
4. Middleware bloqueia todas as rotas privadas sem sessao.
5. Landing pages acessiveis sem autenticacao.
6. Componente exibe apenas dados do usuario corrente.

## Rastreabilidade planejada

1. Schema: src/database/schema.ts
2. Repository: src/userProfile/infrastructure/drizzle-authenticated-user.repository.ts
3. Service: src/userProfile/application/user-profile.service.ts
4. Middleware: middleware.ts
5. UI: src/components/user-profile/user-profile-card.tsx

## Decisoes tecnicas complementares

1. Vinculo de identidade por email Google.
2. Upsert idempotente por unique(email).
3. Proibicao explicita de listagem de usuarios.
4. Escopo de dados minimizado para id, name, profile_picture, email.

## Referencias

- ADR 0035 - Escopos Google OAuth para login com NextAuth
- ADR 0036 - Persistencia de usuario autenticado e protecao de rotas

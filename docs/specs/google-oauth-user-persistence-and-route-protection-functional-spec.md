# Functional Specification - Persistencia de Usuario Google OAuth e Protecao de Rotas

## Objetivo

Definir os requisitos funcionais complementares para:

- Persistir no banco os dados basicos do usuario autenticado por Google OAuth2.
- Permitir que o usuario visualize apenas os proprios dados de perfil.
- Proteger rotas privadas via middleware, mantendo publicas apenas as rotas de landing page.

## Escopo

### Inclui

1. Persistencia de usuario autenticado via Google OAuth2.
2. Modelo de dados com colunas obrigatorias:
- id (uuid)
- name
- profile_picture
- email
3. Camada de repository e service para persistencia/consulta do usuario autenticado.
4. Componente de UI para exibicao das informacoes do proprio usuario.
5. Middleware para restringir acesso as rotas privadas definidas.

### Nao inclui

1. Login/senha local.
2. Armazenamento de senha.
3. Listagem de usuarios.
4. Integracoes com APIs Google adicionais.
5. Permissoes de administrador para consultar outros usuarios.

## Requisitos funcionais

### RF-01 - Persistencia de usuario autenticado

Ao concluir autenticacao via Google OAuth2 com sucesso, o sistema deve persistir os dados do usuario no banco com os campos obrigatorios:

- id (uuid)
- name
- profile_picture
- email

### RF-02 - Regra de atualizacao de cadastro

Se o usuario ja existir (por email), o sistema deve atualizar os campos name e profile_picture com os dados mais recentes retornados pelo Google.

### RF-03 - Nao armazenar senha

O sistema nao deve armazenar senha de usuario em nenhuma tabela relacionada a autenticacao social.

### RF-04 - Sem listagem de usuarios

Nao deve existir funcionalidade de listagem de usuarios em API, service ou UI.

### RF-05 - Visualizacao do proprio perfil

Usuario autenticado deve conseguir visualizar seus proprios dados:

- name
- email
- profile_picture

A tela/componente deve exibir apenas dados do usuario da sessao atual.

### RF-06 - Protecao de rotas privadas

As seguintes rotas devem exigir autenticacao:

- /api/*
- /filter-by-cpf
- /app-settings
- /generator-cpf
- /get-cpfs-by-name
- /hubdo-cpf-lookup

Sub-rotas dessas paginas tambem devem ser consideradas privadas.

### RF-07 - Rotas publicas

Apenas rotas de landing page devem permanecer publicas, incluindo:

- /
- /privacy-policy
- /terms-of-use
- /contact

### RF-08 - Comportamento para nao autenticado

Quando usuario nao autenticado acessar rota privada, o middleware deve redirecionar para fluxo de login.

## Regras de negocio

1. Identidade principal de vinculo: email do Google.
2. Persistencia obrigatoria apos login bem-sucedido.
3. Sem senha local em qualquer circunstancia.
4. Sem endpoint de listagem de usuarios.
5. Usuario so acessa e visualiza seus proprios dados.

## Criterios de aceite

1. Usuario faz login com Google e e persistido com id, name, profile_picture e email.
2. Segundo login do mesmo email atualiza name/profile_picture sem duplicar usuario.
3. Nao existe coluna de senha no schema definido.
4. Nao existe endpoint ou tela de listagem de usuarios.
5. Usuario autenticado visualiza seus dados no componente de perfil.
6. Usuario nao autenticado e bloqueado em /api e paginas privadas.
7. Landing pages permanecem acessiveis sem autenticacao.

## Rastreabilidade planejada

1. Schema: src/database/schema.ts
2. Repository: src/userProfile/infrastructure/*
3. Service: src/userProfile/application/*
4. Middleware: middleware.ts
5. UI perfil: src/components/user-profile/*

## Dependencias

1. Configuracao Google OAuth2 no NextAuth/Auth.js.
2. Banco PostgreSQL com migracao aplicada.
3. Sessao autenticada disponivel no contexto da aplicacao.

## Referencias

- ADR 0035 - Escopos Google OAuth para login com NextAuth
- NextAuth / Auth.js provider Google

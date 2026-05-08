# ADR 0036: Persistencia de Usuario Autenticado e Protecao de Rotas Privadas

## Status

Proposed

## Date

2026-05-08

## Context

O produto passara a autenticar usuarios via Google OAuth2, sem senha local. Para suporte a operacao, auditoria basica e experiencia de usuario, e necessario persistir dados minimos do usuario autenticado.

Tambem e necessario restringir acesso a modulos internos da aplicacao, mantendo publicas apenas as rotas de landing page.

## Decision

Adotar persistencia minima do usuario autenticado em tabela dedicada e aplicar middleware de autenticacao para rotas privadas.

### Decision details

1. Persistir somente:
- id (uuid)
- name
- profile_picture
- email

2. Nao armazenar senha em nenhum fluxo.

3. Implementar repository e service dedicados para:
- upsert por email
- consulta do proprio usuario autenticado

4. Proibir listagem de usuarios na API, service e UI.

5. Proteger por middleware as rotas:
- /api/*
- /filter-by-cpf e sub-rotas
- /app-settings e sub-rotas
- /generator-cpf e sub-rotas
- /get-cpfs-by-name e sub-rotas
- /hubdo-cpf-lookup e sub-rotas

6. Manter publicas apenas landing pages:
- /
- /privacy-policy
- /terms-of-use
- /contact

## Options considered

### Option A: Persistencia minima + middleware seletivo ✅ Chosen

Pros:

- Menor superficie de dados pessoais.
- Alinhamento com principio de minimizacao de dados.
- Implementacao objetiva e adequada ao escopo atual.
- Seguranca reforcada com bloqueio de rotas privadas.

Cons:

- Sem funcionalidades administrativas de gestao de usuarios.

### Option B: Persistir perfil ampliado e liberar parte das rotas internas ❌ Rejected

Pros:

- Mais flexibilidade para funcionalidades futuras.

Cons:

- Aumenta superficie de dados sem necessidade imediata.
- Maior risco operacional e de compliance.
- Contraria requisito de menor privilegio e escopo minimo.

## Consequences

### Positive

1. Controle de acesso claro entre rotas publicas e privadas.
2. Persistencia idempotente e simples por unique(email).
3. Menor risco ao nao armazenar senha.
4. Estrutura pronta para tela de proprio perfil.

### Negative

1. Sem listagem de usuarios para operacao interna.
2. Futuras features de administracao exigirao novo ADR/spec.

### Mitigations

1. Criar novo ADR para qualquer ampliacao de dados de usuario.
2. Exigir aprovacao tecnica e de seguranca para novas permissoes.

## Implementation constraints

1. Schema deve conter apenas os 4 campos definidos nesta decisao.
2. Service/repository nao podem expor metodo de listagem.
3. Middleware deve ser default-deny para modulos internos especificados.
4. Fluxo de autenticacao permanece exclusivamente Google OAuth2.

## Validation strategy

1. Login com Google persiste usuario com id, name, profile_picture e email.
2. Re-login atualiza name/profile_picture sem duplicar email.
3. Acesso anonimo a rota privada e bloqueado.
4. Acesso anonimo as landing pages permanece permitido.
5. Nao existe endpoint/listagem de usuarios.

## Related references

- ADR 0035: Escopos Google OAuth para Login com NextAuth
- docs/specs/google-oauth-user-persistence-and-route-protection-functional-spec.md
- docs/specs/google-oauth-user-persistence-and-route-protection-technical-spec.md

# ADR 0035: Escopos Google OAuth para Login com NextAuth

## Status

Proposed

## Date

2026-05-08

## Context

O produto precisa permitir autenticação de usuários com conta Google usando NextAuth.

Para o fluxo de login social, é necessário definir os escopos OAuth mínimos para:

- identificar o usuário de forma padronizada (OpenID Connect),
- obter e-mail do usuário para criação/vinculação de conta,
- obter dados básicos de perfil para experiência de entrada e identificação visual.

Também é necessário evitar solicitação de permissões excessivas, reduzindo fricção no consentimento e risco de compliance.

## Decision

Adotar os escopos mínimos padrão do provedor Google no NextAuth para autenticação:

- `openid`
- `email`
- `profile`

### Decision details

1. Escopos obrigatórios para login

- O login com Google deve funcionar com `openid email profile`.

2. Escopos adicionais

- Não solicitar escopos extras nesta fase.
- Escopos de APIs Google adicionais (ex.: Drive, Calendar, Gmail) só podem ser adicionados por requisito funcional explícito e aprovado.

3. Menor privilégio

- Aplicar princípio de menor privilégio no consentimento OAuth.

## Options considered

### Option A: Escopos mínimos (`openid email profile`) ✅ Chosen

Pros:

- Menor atrito no consentimento.
- Compatível com autenticação OIDC padrão.
- Atende necessidade de identificação do usuário no produto.

Cons:

- Não permite acesso a dados avançados de outras APIs Google.

### Option B: Incluir escopos amplos desde o início ❌ Rejected

Pros:

- Evita mudanças futuras caso novas integrações surjam.

Cons:

- Viola menor privilégio.
- Aumenta fricção e chance de recusa do consentimento.
- Exige justificativa de segurança/compliance sem necessidade atual.

## Consequences

### Positive

- Fluxo de login simples e previsível.
- Menor superfície de acesso a dados externos.
- Menor necessidade de revisão de segurança nesta fase.

### Negative

- Novas features com APIs Google exigirão evolução posterior de escopos.

### Mitigations

- Documentar claramente que expansão de escopos depende de nova especificação e revisão.

## Implementation constraints

- Manter configuração alinhada ao provedor Google do NextAuth.
- Não introduzir permissões além de `openid email profile` sem novo ADR/spec.

## Validation strategy

- Validar sign-in e callback com Google.
- Confirmar criação/recuperação de sessão com dados básicos de perfil e e-mail.
- Confirmar que não há solicitação de escopos além dos mínimos definidos.

## Related references

- NextAuth Initialization: https://next-auth.js.org/configuration/initialization
- NextAuth Google Provider: https://next-auth.js.org/providers/google
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2

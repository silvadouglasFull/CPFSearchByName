# Technical Specification - Implementação de Login Google com NextAuth

## Visão geral

Implementar autenticação social com Google no NextAuth usando os escopos OAuth mínimos para login padrão: `openid email profile`.

Esta especificação segue ADR 0035 e a documentação oficial do provedor Google no NextAuth.

## Objetivos técnicos

- Integrar `GoogleProvider` ao setup de autenticação.
- Garantir que o consentimento OAuth use apenas escopos mínimos.
- Disponibilizar sessão autenticada com dados básicos do usuário.
- Manter segurança e simplicidade operacional.

## Escopos OAuth necessários

- `openid`
- `email`
- `profile`

Formato esperado de escopo no provider:

- `openid email profile`

## Arquitetura técnica

### 1. Inicialização do NextAuth

- Usar route handler do App Router para autenticação.
- Expor handlers `GET` e `POST` na rota de auth.

### 2. Configuração do Google Provider

- Configurar `clientId` e `clientSecret` via variáveis de ambiente.
- Definir escopo OAuth mínimo de autenticação:
  - `authorization.params.scope = 'openid email profile'`

### 3. Callback e sessão

- Fluxo OAuth retorna para callback Google do NextAuth.
- NextAuth cria sessão da aplicação após validação do retorno.
- Dados básicos do perfil ficam acessíveis em callbacks/sessão conforme estratégia do projeto.

## Configuração de ambiente

Variáveis mínimas:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Redirect URI no Google Cloud Console:

- Produção: `https://<dominio>/api/auth/callback/google`
- Desenvolvimento: `http://localhost:3000/api/auth/callback/google`

## Restrições e decisões

1. Sem escopos adicionais nesta fase

- Não incluir permissões para outras APIs Google.

2. Menor privilégio obrigatório

- Qualquer ampliação de escopo exige novo requisito e revisão técnica/segurança.

3. Compatibilidade

- Manter implementação aderente ao padrão NextAuth do projeto atual.

## Tratamento de erros

- Erros no handshake OAuth devem impedir criação de sessão.
- Em caso de erro, retornar usuário ao fluxo de autenticação sem sessão ativa.

## Segurança e privacidade

- Limitar permissões ao mínimo necessário para autenticação.
- Não solicitar acesso a dados de APIs externas sem justificativa de produto.
- Proteger credenciais OAuth via ambiente seguro.

## Plano de validação

1. Fluxo feliz

- Iniciar sign-in com Google.
- Autorizar consentimento.
- Confirmar redirecionamento para callback.
- Confirmar sessão ativa no app.

2. Validação de escopos

- Confirmar no request OAuth que os escopos solicitados são apenas `openid email profile`.

3. Falhas

- Simular cancelamento de consentimento e erro de callback.
- Confirmar ausência de sessão criada.

## Rastreabilidade (Planejada)

1. Rota de autenticação

- `app/api/auth/[...nextauth]/route.ts`

2. Configuração de provider

- Setup de providers do NextAuth no arquivo de auth principal.

3. Interface de login

- Página/componente de login responsável por iniciar `signIn('google')`.

## Referências

- NextAuth Initialization: https://next-auth.js.org/configuration/initialization
- NextAuth Google Provider: https://next-auth.js.org/providers/google
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2

# Functional Specification - Login com Google via NextAuth

## Objetivo

Permitir que usuários entrem na aplicação com conta Google usando NextAuth, com escopos OAuth mínimos necessários para autenticação.

## Escopos OAuth necessários

- `openid`
- `email`
- `profile`

## Escopo

- Habilitar botão/ação de login com Google.
- Executar fluxo OAuth com callback do NextAuth.
- Criar/atualizar sessão autenticada no app.
- Capturar dados básicos do usuário para identificação na sessão (e-mail e perfil básico).

## Fora de escopo

- Integrações com APIs adicionais do Google (Drive, Calendar, Gmail, etc.).
- Solicitação de escopos extras além de `openid email profile`.
- Gestão avançada de permissões por feature externa.

## Jornada do usuário

1. Usuário acessa a tela de autenticação.
2. Usuário escolhe entrar com Google.
3. Google apresenta consentimento com escopos mínimos necessários.
4. Usuário autoriza e retorna ao callback do app.
5. Sistema estabelece sessão autenticada e redireciona para área interna.

## Entradas

- Ação do usuário: iniciar login com Google.
- Configuração do OAuth no provedor Google Cloud (client id/secret e redirect URI).

## Saídas

- Sessão de usuário autenticado no app.
- Perfil básico disponível no contexto de sessão (nome, e-mail, imagem quando disponível).

## Regras de negócio

1. Escopos obrigatórios

- O fluxo deve usar apenas os escopos `openid email profile` para autenticação padrão.

2. Menor privilégio

- É proibido adicionar escopos extras sem requisito funcional aprovado e nova especificação.

3. Consistência de callback

- O callback deve usar rota padrão do NextAuth para Google.

4. Segurança básica

- Login só é considerado válido quando o fluxo OAuth é finalizado com sucesso e sessão é criada pelo NextAuth.

## Requisitos não funcionais

- Fluxo de login deve ser responsivo e previsível em desktop e mobile.
- Não deve haver solicitação de permissões além do necessário para autenticação.

## Critérios de aceite

1. Usuário consegue autenticar com Google e acessar área protegida.
2. Consentimento OAuth solicita somente `openid`, `email` e `profile`.
3. Sessão contém dados básicos de perfil após login.
4. Falhas de autenticação retornam usuário para fluxo de login sem sessão ativa.
5. Não há dependência de escopos adicionais para concluir login.

## Rastreabilidade (Planejada)

1. Configuração do NextAuth

- `app/api/auth/[...nextauth]/route.ts`

2. Provider Google

- Configuração do `GoogleProvider` com escopo padrão mínimo.

3. UI de autenticação

- Página/componente de login onde ocorre ação de entrar com Google.

## Referências

- NextAuth Initialization: https://next-auth.js.org/configuration/initialization
- NextAuth Google Provider: https://next-auth.js.org/providers/google

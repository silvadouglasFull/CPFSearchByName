# Technical Specification - Default App Settings Async Initialization

## Overview

Implementar inicializacao assíncrona (nao-bloqueante) de DEFAULT_APP_SETTINGS apos autenticacao bem-sucedida de novo usuario, integrando no fluxo OAuth2 sem latencia adicional.

## Fluxo tecnico

### Pré-Login

Usuario e redirecionado para Google OAuth2.

### Post-OAuth Callback

1. NextAuth callback `signIn` e acionado com perfil do Google.
2. `UserProfileService.persistAuthenticatedUser()` e chamado com await para persistir usuario no banco.
3. Se sucesso, usuario persisted retorna com `id` interno.
4. Imediatamente apos, sem await:
   - Disparar inicializacao de DEFAULT_APP_SETTINGS para usuario persisted.
   - Usar `Promise.resolve().then()` ou `void Promise` para nao bloquear.
5. signIn callback retorna `true`, autenticacao continua.
6. Sessao/JWT criado e retornado ao usuario.

### Background (paralelo)

Enquanto usuario esta finalizando login:

1. `AppSettingsService.initializeDefaultSettingsForUser(userId)` e chamado.
2. Chama `repository.upsertGlobal(userId, DEFAULT_APP_SETTINGS)`.
3. Se ja existe (unlikely), upsert nao causa erro (idempotente).
4. Se sucesso, log `info`: "Settings initialized for user {userId}".
5. Se erro, log `error`: "Failed to initialize settings for user {userId}: {error}".

### Post-Login

Usuario ja tem sessao valida. Quando acessa `/api/app-settings`:

1. Proxy injeta header `x-authenticated-user-id`.
2. Rota consulta settings via `AppSettingsService.getSettings(userId)`.
3. Se settings ja foram criadas (expected), retorna configuracoes.
4. Se ainda nao criadas (race condition rara), retorna fallback DEFAULT_APP_SETTINGS em-memoria.

## Implementation points

### 1. Auth Callback Enhancement

Arquivo: `src/auth/auth-options.ts`

```typescript
callbacks: {
    async signIn({ user }) {
        // ... existing code ...
        const persisted = await userProfileService.persistAuthenticatedUser({...});

        // Disparar async init sem await
        void (async () => {
            try {
                await initializeDefaultSettings(persisted.id);
            } catch (error) {
                console.error('Failed to initialize default app settings:', error);
            }
        })();

        return true;
    },
}
```

### 2. New Service Method

Arquivo: `src/appSettings/application/app-settings.service.ts`

Adicionar metodo:

```typescript
async initializeDefaultSettings(authenticatedUserId: string): Promise<void> {
    const userId = this.requireAuthenticatedUserId(authenticatedUserId);
    const existing = await this.repository.getGlobal(userId);

    if (existing) {
        return; // ja existe, nao faz nada
    }

    await this.repository.upsertGlobal(userId, DEFAULT_APP_SETTINGS);
}
```

### 3. Index Export

Arquivo: `src/appSettings/index.ts`

Exportar funcao helper:

```typescript
export function createAppSettingsService(): AppSettingsService {
  return new AppSettingsService(new DrizzleAppSettingsRepository());
}

export async function initializeDefaultSettings(userId: string): Promise<void> {
  return createAppSettingsService().initializeDefaultSettings(userId);
}
```

### 4. Error Handling

- Toda erro em background e capturado e logado.
- Nao propagado para usuario.
- Nao bloqueia fluxo de autenticacao.

## Concurrency considerations

1. Multiplos usuarios fazendo login simultaneamente: cada um dispara sua propria inicializacao, isolada.
2. Mesmo usuario fazendo login 2x (improvavel): segunda tentativa e upsert idempotente, sem erro.
3. Database: uniqueness composto em (authenticated_user_id, singleton_key) previne duplicidade.

## Validation plan

1. **Unit test**: Verificar que `initializeDefaultSettings()` cria settings corretos.
2. **Integration test**: Novo usuario faz login, settings existem dentro de Ns após.
3. **Race condition test**: Parallelizar 10 logins, verificar isolamento.
4. **Error handling test**: Force erro na criacao, verifique que login continua normal.
5. **Idempotency test**: Chamada 2x para mesmo usuario, sem erro.

## Affected files

1. `src/auth/auth-options.ts`
2. `src/appSettings/application/app-settings.service.ts`
3. `src/appSettings/index.ts`
4. Potencialmente: logging/observability para monitorar inicializacoes

## Backward compatibility

- Nao quebra nada: operacao e assíncrona e isolada.
- Usuarios atuais: settings j

á existem, inicializacao e idempotente.

- Fallback existe em APIs: sempre funciona mesmo se settings ainda nao foram criadas.

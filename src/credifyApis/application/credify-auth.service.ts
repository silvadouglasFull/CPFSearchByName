import { CredifyApiError, CredifyAuthResponse } from '@/credifyApis/domain/types';

type CachedToken = {
    value: string;
    expiresAt: number;
};

export class CredifyAuthService {
    private cachedToken: CachedToken | null = null;

    constructor(
        private readonly baseUrl: string = process.env.CREDIFYAPIS_BASE_URL || 'https://api.credify.com.br',
        private readonly clientId: string = process.env.CREDIFYAPIS_CLIENT_ID || '',
        private readonly clientSecret: string = process.env.CREDIFYAPIS_CLIENT_SECRET || '',
        private readonly expirySkewSeconds: number = Number(process.env.CREDIFYAPIS_TOKEN_EXPIRY_SKEW_SECONDS || 300),
        private readonly timeoutMs: number = Number(process.env.CREDIFYAPIS_TIMEOUT_MS || 30000),
    ) {
        if (!this.clientId || !this.clientSecret) {
            throw new CredifyApiError(
                'CREDIFY_CREDENTIALS_MISSING',
                'CREDIFYAPIS_CLIENT_ID and CREDIFYAPIS_CLIENT_SECRET are required.',
            );
        }
    }

    async getValidToken(forceRefresh: boolean = false): Promise<string> {
        if (!forceRefresh && this.cachedToken && Date.now() < this.cachedToken.expiresAt) {
            return this.cachedToken.value;
        }

        const token = await this.fetchToken();
        this.cachedToken = {
            value: token,
            expiresAt: this.getTokenExpiry(token),
        };

        return token;
    }

    private async fetchToken(): Promise<string> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const response = await fetch(`${this.baseUrl}/auth`, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    ClientID: this.clientId,
                    ClientSecret: this.clientSecret,
                }),
                cache: 'no-store',
                signal: controller.signal,
            });

            if (!response.ok) {
                throw new CredifyApiError('CREDIFY_AUTH_FAILED', `Credify auth failed with status ${response.status}.`);
            }

            const payload = (await response.json()) as CredifyAuthResponse;
            if (!payload.Success || !payload.Dados) {
                throw new CredifyApiError(
                    'CREDIFY_AUTH_FAILED',
                    payload.Message || 'Credify auth returned no token.',
                );
            }

            return payload.Dados;
        } catch (error) {
            if (error instanceof CredifyApiError) {
                throw error;
            }

            if (error instanceof Error && error.name === 'AbortError') {
                throw new CredifyApiError('CREDIFY_AUTH_TIMEOUT', 'Credify auth request timed out.');
            }

            throw new CredifyApiError(
                'CREDIFY_AUTH_FAILED',
                error instanceof Error ? error.message : 'Unknown auth error.',
            );
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private getTokenExpiry(token: string): number {
        const fallbackTtlMs = 24 * 60 * 60 * 1000;

        try {
            const [, payload] = token.split('.');
            if (!payload) {
                return Date.now() + fallbackTtlMs - this.expirySkewSeconds * 1000;
            }

            const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
            if (!decoded.exp || !Number.isFinite(decoded.exp)) {
                return Date.now() + fallbackTtlMs - this.expirySkewSeconds * 1000;
            }

            return decoded.exp * 1000 - this.expirySkewSeconds * 1000;
        } catch {
            return Date.now() + fallbackTtlMs - this.expirySkewSeconds * 1000;
        }
    }
}

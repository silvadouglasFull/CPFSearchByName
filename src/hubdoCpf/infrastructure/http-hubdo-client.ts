/**
 * HTTP Client for HubDo WebService
 * Handles requests, retries, error mapping, and response parsing
 */

import {
    HubdoCpfError,
    HubdoCpfIpError,
    HubdoCpfNotFoundError,
    HubdoCpfServiceError,
    HubdoCpfTimeoutError,
    HubdoCpfTokenError,
    HubdoCpfValidationError,
    HubdoRawResponse
} from '@/hubdoCpf/domain/types';

export class HubdoHttpClient {
    private readonly token: string;
    private readonly baseUrl: string;
    private readonly timeoutMs: number;
    private readonly turboTimeoutMs: number;
    private readonly maxRetries: number;
    private readonly backoffMs: number;

    constructor(
        token: string = process.env.HUBDO_TOKEN || '',
        baseUrl: string = process.env.HUBDO_BASE_URL || 'https://ws.hubdodesenvolvedor.com.br/v2',
        timeoutMs: number = parseInt(process.env.HUBDO_TIMEOUT_MS || '600000'),
        turboTimeoutMs: number = parseInt(process.env.HUBDO_TURBO_TIMEOUT_MS || '30000'),
        maxRetries: number = parseInt(process.env.HUBDO_MAX_RETRIES || '3'),
        backoffMs: number = parseInt(process.env.HUBDO_BACKOFF_MS || '1000'),
    ) {
        if (!token) {
            throw new Error('HUBDO_TOKEN environment variable is required');
        }

        this.token = token;
        this.baseUrl = baseUrl;
        this.timeoutMs = timeoutMs;
        this.turboTimeoutMs = turboTimeoutMs;
        this.maxRetries = maxRetries;
        this.backoffMs = backoffMs;
    }

    async queryCpf(
        cpf: string,
        birthDate?: string,
        turbo: boolean = false,
    ): Promise<HubdoRawResponse> {
        const normalizedCpf = this.normalizeCpf(cpf);
        this.validateCpf(normalizedCpf);

        const url = this.buildUrl(normalizedCpf, birthDate, turbo);
        const timeout = turbo ? this.turboTimeoutMs : this.timeoutMs;

        return this.retryWithBackoff(
            async () => this.executeRequest(url, timeout),
            this.maxRetries,
        );
    }

    private buildUrl(cpf: string, birthDate?: string, turbo: boolean = false): string {
        const params = new URLSearchParams();
        params.set('cpf', cpf);
        params.set('token', this.token);

        if (birthDate) {
            params.set('data', birthDate);
        }

        if (turbo) {
            params.set('turbo', '1');
        }

        return `${this.baseUrl}/cpf/?${params.toString()}`;
    }

    private async executeRequest(url: string, timeoutMs: number): Promise<HubdoRawResponse> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Accept: 'application/json',
                },
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new HubdoCpfServiceError(
                    `HubDo API returned status ${response.status}`,
                );
            }

            const data = (await response.json()) as HubdoRawResponse;
            this.handleApiResponse(data);

            return data;
        } catch (error) {
            if (error instanceof HubdoCpfError) {
                throw error;
            }

            if (error instanceof Error && error.name === 'AbortError') {
                throw new HubdoCpfTimeoutError();
            }

            throw new HubdoCpfServiceError(
                error instanceof Error ? error.message : 'Unknown error',
            );
        }
    }

    private handleApiResponse(data: HubdoRawResponse): void {
        if (!data.status || data.return === 'NOK') {
            this.mapErrorResponse(data);
        }
    }

    private mapErrorResponse(data: HubdoRawResponse): void {
        const message = data.message || 'Unknown error';

        // Error code mapping based on HubDo documentation
        const errorMap: Record<string, () => never> = {
            'Parametro Invalido.': () => {
                throw new HubdoCpfValidationError('CPF format invalid. Provide 11 digits only.');
            },
            'Data de Nascimento não informada para Consulta On-line': () => {
                throw new HubdoCpfValidationError('Birth date required for online queries (DD/MM/YYYY format).');
            },
            'CPF Inválido.': () => {
                throw new HubdoCpfNotFoundError('CPF not found in Receita Federal.');
            },
            'Data Nascimento Inválida': () => {
                throw new HubdoCpfValidationError('Birth date invalid. Use DD/MM/YYYY format.');
            },
            'Token Inválido ou sem saldo para a consulta.': () => {
                throw new HubdoCpfTokenError('Token invalid or insufficient balance.');
            },
            'Token Bloqueado. Aguarde alguns instantes ou entre em contato.': () => {
                throw new HubdoCpfTokenError('Token blocked. Try later or contact support.');
            },
            'IP de origem nao identificado.': () => {
                throw new HubdoCpfIpError();
            },
            'IP de origem nao permitido.': () => {
                throw new HubdoCpfIpError();
            },
            'Limite Excedido': () => {
                throw new HubdoCpfError('RATE_LIMITED', 'Rate limit exceeded for this IP.');
            },
            'Timeout.': () => {
                throw new HubdoCpfTimeoutError();
            },
            'Consulta não retornou': () => {
                throw new HubdoCpfServiceError('No response from Receita Federal. Try again.');
            },
            'Nao foi possivel obter o captcha': () => {
                throw new HubdoCpfServiceError('Failed to obtain captcha. Try again.');
            },
            'Erro ao obter retorno.': () => {
                throw new HubdoCpfServiceError('Error obtaining response from Receita Federal.');
            },
            'Nao foi possivel conectar ao Proxy.': () => {
                throw new HubdoCpfServiceError('Failed to connect to proxy.');
            },
        };

        // Try to find matching error message
        for (const [errorMsg, handler] of Object.entries(errorMap)) {
            if (message.includes(errorMsg)) {
                handler();
            }
        }

        // Default error if no match
        throw new HubdoCpfError('UNKNOWN_ERROR', message);
    }

    private normalizeCpf(cpf: string): string {
        return cpf.replace(/\D/g, '');
    }

    private validateCpf(cpf: string): void {
        if (!/^\d{11}$/.test(cpf)) {
            throw new HubdoCpfValidationError(
                'CPF must contain 11 digits. Provide numbers only.',
            );
        }
    }

    private async retryWithBackoff(
        fn: () => Promise<HubdoRawResponse>,
        maxRetries: number,
    ): Promise<HubdoRawResponse> {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));

                // Don't retry validation or token errors
                if (
                    error instanceof HubdoCpfValidationError ||
                    error instanceof HubdoCpfTokenError ||
                    error instanceof HubdoCpfNotFoundError ||
                    error instanceof HubdoCpfIpError
                ) {
                    throw error;
                }

                // Retry only on timeout and service errors
                if (attempt < maxRetries) {
                    const delayMs = this.backoffMs * Math.pow(2, attempt);
                    await new Promise((resolve) => setTimeout(resolve, delayMs));
                }
            }
        }

        throw lastError || new HubdoCpfServiceError('Max retries exceeded');
    }
}

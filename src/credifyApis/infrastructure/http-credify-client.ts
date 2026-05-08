import { CredifyAuthService } from '@/credifyApis/application/credify-auth.service';
import {
    CredifyApiError,
    CredifyPhoneLookupRequest,
    CredifyPhoneLookupResult,
} from '@/credifyApis/domain/types';

type CredifyPayloadWrapper = 'none' | 'Consulta' | 'CONSULTA';

export class CredifyHttpClient {
    constructor(
        private readonly authService: CredifyAuthService,
        private readonly baseUrl: string = process.env.CREDIFYAPIS_BASE_URL || 'https://api.credify.com.br',
        private readonly timeoutMs: number = Number(process.env.CREDIFYAPIS_TIMEOUT_MS || 30000),
        private readonly authHeaderType: 'bearer' | 'raw' = (process.env.CREDIFYAPIS_AUTH_HEADER_TYPE === 'raw' ? 'raw' : 'bearer'),
        private readonly payloadWrapper: CredifyPayloadWrapper = this.resolvePayloadWrapper(),
    ) { }

    async lookupPhone(input: CredifyPhoneLookupRequest): Promise<CredifyPhoneLookupResult> {
        const token = await this.authService.getValidToken(false);

        try {
            const response = await this.executeLookup(token, input);
            return this.mapLookupResponse(response);
        } catch (error) {
            if (error instanceof CredifyApiError && error.code === 'CREDIFY_LOOKUP_UNAUTHORIZED') {
                const refreshedToken = await this.authService.getValidToken(true);
                const retryResponse = await this.executeLookup(refreshedToken, input);
                return this.mapLookupResponse(retryResponse);
            }

            throw error;
        }
    }

    private async executeLookup(token: string, input: CredifyPhoneLookupRequest): Promise<unknown> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
            const response = await fetch(`${this.baseUrl}/pftelefone`, {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    'content-type': 'application/json',
                    Authorization: this.authHeaderType === 'raw' ? token : `Bearer ${token}`,
                },
                body: JSON.stringify(this.buildRequestPayload(input)),
                cache: 'no-store',
                signal: controller.signal,
            });

            if (response.status === 401) {
                throw new CredifyApiError('CREDIFY_LOOKUP_UNAUTHORIZED', 'Credify lookup unauthorized.');
            }

            if (!response.ok) {
                throw new CredifyApiError(
                    'CREDIFY_LOOKUP_FAILED',
                    `Credify lookup failed with status ${response.status}.`,
                );
            }

            return response.json();
        } catch (error) {
            if (error instanceof CredifyApiError) {
                throw error;
            }

            if (error instanceof Error && error.name === 'AbortError') {
                throw new CredifyApiError('CREDIFY_LOOKUP_TIMEOUT', 'Credify phone lookup request timed out.');
            }

            throw new CredifyApiError(
                'CREDIFY_LOOKUP_FAILED',
                error instanceof Error ? error.message : 'Unknown lookup error.',
            );
        } finally {
            clearTimeout(timeoutId);
        }
    }

    private buildRequestPayload(input: CredifyPhoneLookupRequest): Record<string, unknown> {
        const basePayload = {
            IdConsulta: input.providerQueryId,
            Ddd: input.ddd,
            Telefone: input.localNumber,
            TipoPessoa: 'F',
        };

        if (this.payloadWrapper === 'Consulta') {
            return { Consulta: basePayload };
        }

        if (this.payloadWrapper === 'CONSULTA') {
            return { CONSULTA: basePayload };
        }

        return basePayload;
    }

    private mapLookupResponse(rawResponse: unknown): CredifyPhoneLookupResult {
        const payload = rawResponse as Record<string, unknown>;
        const resposta = this.asRecord(payload.RESPOSTA) ?? this.asRecord(payload.resposta);
        const providerCode = String(
            resposta?.CODIGO ??
            resposta?.codigo ??
            payload.CODIGO ??
            payload.codigo ??
            '3',
        );

        const buscaTelefone =
            this.asRecord(resposta?.BUSCATELEFONE) ??
            this.asRecord(resposta?.buscaTelefone) ??
            this.firstRecord(resposta?.BUSCATELEFONE) ??
            this.firstRecord(resposta?.buscaTelefone);

        const providerMessage = String(
            resposta?.MENSAGEM ?? resposta?.mensagem ?? payload.MENSAGEM ?? payload.mensagem ?? '',
        ) || undefined;

        if (providerCode === '1') {
            return {
                status: 'success',
                providerCode,
                providerMessage,
                cpf: this.asString(buscaTelefone?.CPF ?? buscaTelefone?.cpf),
                nome: this.asString(buscaTelefone?.NOME ?? buscaTelefone?.nome),
                tpLogradouro: this.asString(buscaTelefone?.TPLOGRADOURO ?? buscaTelefone?.tpLogradouro),
                logradouro: this.asString(buscaTelefone?.LOGRADOURO ?? buscaTelefone?.logradouro),
                numero: this.asString(buscaTelefone?.NUMERO ?? buscaTelefone?.numero),
                endereco: this.asString(buscaTelefone?.ENDERECO ?? buscaTelefone?.endereco),
                complemento: this.asString(buscaTelefone?.COMPLEMENTO ?? buscaTelefone?.complemento),
                bairro: this.asString(buscaTelefone?.BAIRRO ?? buscaTelefone?.bairro),
                cidade: this.asString(buscaTelefone?.CIDADE ?? buscaTelefone?.cidade),
                uf: this.asString(buscaTelefone?.UF ?? buscaTelefone?.uf),
                cep: this.asString(buscaTelefone?.CEP ?? buscaTelefone?.cep),
                phoneType: this.asString(buscaTelefone?.TP ?? buscaTelefone?.tp),
                rawResponse,
            };
        }

        if (providerCode === '2') {
            return {
                status: 'not_found',
                providerCode,
                providerMessage,
                rawResponse,
            };
        }

        return {
            status: 'error',
            providerCode,
            providerMessage,
            rawResponse,
        };
    }

    private resolvePayloadWrapper(): CredifyPayloadWrapper {
        const rawValue = process.env.CREDIFYAPIS_PAYLOAD_WRAPPER;
        if (rawValue === 'Consulta' || rawValue === 'CONSULTA' || rawValue === 'none') {
            return rawValue;
        }

        return 'none';
    }

    private asRecord(value: unknown): Record<string, unknown> | null {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }

        return value as Record<string, unknown>;
    }

    private firstRecord(value: unknown): Record<string, unknown> | null {
        if (!Array.isArray(value) || value.length === 0) {
            return null;
        }

        const first = value[0];
        return this.asRecord(first);
    }

    private asString(value: unknown): string | undefined {
        if (typeof value !== 'string') {
            return undefined;
        }

        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
}

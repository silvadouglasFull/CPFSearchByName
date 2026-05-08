import {
    CreateCredifyPhoneLookupInput,
    CredifyApiError,
    CredifyPhoneLookupRepository,
} from '@/credifyApis/domain/types';
import { CredifyHttpClient } from '@/credifyApis/infrastructure/http-credify-client';

export type ProcessCredifyPhoneLookupInput = {
    jobId: string;
    itemId: string;
    rawPhone: string;
    normalizedPhone: string;
    ddd: string;
    localNumber: string;
    providerQueryId: string;
};

export type ProcessCredifyPhoneLookupOutput = {
    lookupId: string;
    status: 'success' | 'not_found' | 'error';
    providerCode: string;
    errorCode?: string;
    errorMessage?: string;
};

export class CredifyPhoneLookupService {
    constructor(
        private readonly httpClient: CredifyHttpClient,
        private readonly repository: CredifyPhoneLookupRepository,
    ) { }

    async process(input: ProcessCredifyPhoneLookupInput): Promise<ProcessCredifyPhoneLookupOutput> {
        try {
            const response = await this.httpClient.lookupPhone({
                rawPhone: input.rawPhone,
                normalizedPhone: input.normalizedPhone,
                ddd: input.ddd,
                localNumber: input.localNumber,
                providerQueryId: input.providerQueryId,
            });

            const persisted = await this.repository.save({
                jobId: input.jobId,
                jobItemId: input.itemId,
                rawPhone: input.rawPhone,
                normalizedPhone: input.normalizedPhone,
                ddd: input.ddd,
                localNumber: input.localNumber,
                providerQueryId: input.providerQueryId,
                status: response.status,
                providerCode: response.providerCode,
                providerMessage: response.providerMessage,
                cpf: response.cpf,
                nome: response.nome,
                tpLogradouro: response.tpLogradouro,
                logradouro: response.logradouro,
                numero: response.numero,
                endereco: response.endereco,
                complemento: response.complemento,
                bairro: response.bairro,
                cidade: response.cidade,
                uf: response.uf,
                cep: response.cep,
                phoneType: response.phoneType,
                rawResponse: response.rawResponse,
                finishedAt: new Date(),
            });

            return {
                lookupId: persisted.id,
                status: response.status,
                providerCode: response.providerCode,
            };
        } catch (error) {
            const mappedError = this.mapError(error);

            const persisted = await this.repository.save({
                jobId: input.jobId,
                jobItemId: input.itemId,
                rawPhone: input.rawPhone,
                normalizedPhone: input.normalizedPhone,
                ddd: input.ddd,
                localNumber: input.localNumber,
                providerQueryId: input.providerQueryId,
                status: 'error',
                providerCode: mappedError.providerCode,
                errorCode: mappedError.errorCode,
                errorMessage: mappedError.errorMessage,
                rawResponse: mappedError.rawResponse,
                finishedAt: new Date(),
            } as CreateCredifyPhoneLookupInput);

            return {
                lookupId: persisted.id,
                status: 'error',
                providerCode: mappedError.providerCode,
                errorCode: mappedError.errorCode,
                errorMessage: mappedError.errorMessage,
            };
        }
    }

    private mapError(error: unknown): {
        providerCode: string;
        errorCode: string;
        errorMessage: string;
        rawResponse?: unknown;
    } {
        if (error instanceof CredifyApiError) {
            return {
                providerCode: '3',
                errorCode: error.code,
                errorMessage: error.message,
            };
        }

        return {
            providerCode: '3',
            errorCode: 'CREDIFY_UNEXPECTED_ERROR',
            errorMessage: error instanceof Error ? error.message : 'Unknown Credify error.',
        };
    }
}

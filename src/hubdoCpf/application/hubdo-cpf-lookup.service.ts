/**
 * HubDo CPF Lookup Service
 * Orchestrates CPF lookup, response mapping, and persistence
 */

import {
    CreateHubdoCpfLookupInput,
    HubdoCpfError,
    HubdoCpfLookupRecord,
    HubdoCpfLookupRepository,
    HubdoCpfLookupRequest,
    HubdoCpfLookupResponse,
    HubdoRawResponse,
} from '@/hubdoCpf/domain/types';
import { HubdoHttpClient } from '@/hubdoCpf/infrastructure/http-hubdo-client';

export class HubdoCpfLookupService {
    constructor(
        private httpClient: HubdoHttpClient,
        private repository: HubdoCpfLookupRepository,
    ) {}

    async lookup(request: HubdoCpfLookupRequest): Promise<HubdoCpfLookupResponse> {
        const normalizedCpf = this.normalizeCpf(request.cpf);
        const turbo = request.mode === 'turbo';

        try {
            // Call HubDo API
            const rawResponse = await this.httpClient.queryCpf(
                normalizedCpf,
                request.birthDate,
                turbo,
            );

            // Map and persist
            const persistedRecord = await this.persistSuccessResponse(
                normalizedCpf,
                request.birthDate,
                turbo,
                rawResponse,
            );

            return this.mapSuccessResponse(persistedRecord, rawResponse);
        } catch (error) {
            if (error instanceof HubdoCpfError) {
                // Persist error attempt
                await this.persistErrorResponse(
                    normalizedCpf,
                    request.birthDate,
                    turbo,
                    error,
                );

                return this.mapErrorResponse(error);
            }

            // Unexpected error
            const unexpectedError = new HubdoCpfError(
                'UNEXPECTED_ERROR',
                error instanceof Error ? error.message : 'Unknown error',
            );

            await this.persistErrorResponse(
                normalizedCpf,
                request.birthDate,
                turbo,
                unexpectedError,
            );

            return this.mapErrorResponse(unexpectedError);
        }
    }

    private async persistSuccessResponse(
        cpf: string,
        birthDate: string | undefined,
        turbo: boolean,
        rawResponse: HubdoRawResponse,
    ): Promise<HubdoCpfLookupRecord> {
        const input: CreateHubdoCpfLookupInput = {
            cpf,
            birthDate,
            queryMode: turbo ? 'turbo' : 'normal',
            requestStatus: rawResponse.return,
            creditosConsumidos: rawResponse.consumed,
            origem: this.determineOrigin(rawResponse, turbo),
            fullResponse: rawResponse as Record<string, any>,
        };

        if (rawResponse.return === 'OK' && rawResponse.result) {
            input.responseName = rawResponse.result.nome_da_pf;
            input.responseBirthDate = rawResponse.result.data_nascimento;
            input.responseCadastralStatus = rawResponse.result.situacao_cadastral;
            input.responseInscriptionDate = rawResponse.result.data_inscricao;
            input.responseCheckDigit = rawResponse.result.digito_verificador;
            input.responseProof = rawResponse.result.comprovante_emitido;
            input.responseProofDate = rawResponse.result.comprovante_emitido_data;
        }

        return this.repository.save(input);
    }

    private async persistErrorResponse(
        cpf: string,
        birthDate: string | undefined,
        turbo: boolean,
        error: HubdoCpfError,
    ): Promise<HubdoCpfLookupRecord> {
        const input: CreateHubdoCpfLookupInput = {
            cpf,
            birthDate,
            queryMode: turbo ? 'turbo' : 'normal',
            requestStatus: 'NOK',
            errorCode: error.code,
            errorMessage: error.message,
            creditosConsumidos: error.creditosConsumidos,
            origem: 'receita_federal',
        };

        return this.repository.save(input);
    }

    private mapSuccessResponse(
        record: HubdoCpfLookupRecord,
        rawResponse: HubdoRawResponse,
    ): HubdoCpfLookupResponse {
        return {
            status: 'success',
            cpf: this.formatCpf(record.cpf),
            nome: record.responseName,
            dataNascimento: record.responseBirthDate,
            situacaoCadastral: record.responseCadastralStatus,
            dataInscricao: record.responseInscriptionDate,
            digitoVerificador: record.responseCheckDigit,
            comprovante: record.responseProof,
            dataComprovante: record.responseProofDate,
            creditosConsumidos: record.creditosConsumidos,
            origem: record.origem as 'database' | 'receita_federal' | 'turbo',
        };
    }

    private mapErrorResponse(error: HubdoCpfError): HubdoCpfLookupResponse {
        return {
            status: 'error',
            cpf: '',
            errorCode: error.code,
            message: error.message,
            creditosConsumidos: error.creditosConsumidos,
        };
    }

    private determineOrigin(
        rawResponse: HubdoRawResponse,
        turbo: boolean,
    ): 'database' | 'receita_federal' | 'turbo' {
        if (turbo) return 'turbo';
        // If consumed 1 credit, likely from database cache
        if (rawResponse.consumed === 1) return 'database';
        return 'receita_federal';
    }

    private normalizeCpf(cpf: string): string {
        return cpf.replace(/\D/g, '');
    }

    private formatCpf(cpf: string): string {
        const normalized = this.normalizeCpf(cpf);
        if (normalized.length !== 11) {
            return normalized;
        }
        return `${normalized.substring(0, 3)}.${normalized.substring(3, 6)}.${normalized.substring(6, 9)}-${normalized.substring(9)}`;
    }
}

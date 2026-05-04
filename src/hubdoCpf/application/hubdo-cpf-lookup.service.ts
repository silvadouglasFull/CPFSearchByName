/**
 * HubDo CPF Lookup Service
 * Orchestrates CPF lookup, response mapping, and persistence
 */

import {
    CreateHubdoCpfLookupInput,
    HubdoCpfError,
    HubdoCpfLookupHistoryListParams,
    HubdoCpfLookupRecord,
    HubdoCpfLookupRepository,
    HubdoCpfLookupRequest,
    HubdoCpfLookupResponse,
    HubdoRawResponse,
    PaginatedHubdoCpfLookupHistory,
} from '@/hubdoCpf/domain/types';
import { HubdoHttpClient } from '@/hubdoCpf/infrastructure/http-hubdo-client';
import { formatCpf, normalizeCpf } from '@/security/cpf-protection';

export class HubdoCpfLookupService {
    constructor(
        private httpClient: HubdoHttpClient,
        private repository: HubdoCpfLookupRepository,
    ) {}

    async lookup(request: HubdoCpfLookupRequest): Promise<HubdoCpfLookupResponse> {
        const normalizedCpf = normalizeCpf(request.cpf);
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

            return this.mapSuccessResponse(persistedRecord);
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

    async listHistory(params: HubdoCpfLookupHistoryListParams): Promise<PaginatedHubdoCpfLookupHistory> {
        const normalizedCpf = params.cpf ? normalizeCpf(params.cpf) : undefined;

        return this.repository.list({
            page: params.page,
            pageSize: params.pageSize,
            cpf: normalizedCpf,
        });
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
            fullResponse: rawResponse as unknown as Record<string, unknown>,
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

    private mapSuccessResponse(record: HubdoCpfLookupRecord): HubdoCpfLookupResponse {
        return {
            status: 'success',
            cpf: formatCpf(record.cpf),
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
}

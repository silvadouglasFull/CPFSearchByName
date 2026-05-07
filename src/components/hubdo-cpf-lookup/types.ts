import { HubdoCpfLookupResponse } from '@/hubdoCpf';

export interface HubdoCpfSearchFormState {
    cpf: string;
    birthDate: string;
    mode: 'normal' | 'turbo';
}

export interface HubdoCpfHistoryItem {
    id: string;
    cpf: string;
    birthDate?: string;
    queryMode: 'normal' | 'turbo';
    requestStatus: 'OK' | 'NOK';
    errorCode?: string;
    errorMessage?: string;
    responseName?: string;
    responseBirthDate?: string;
    responseCadastralStatus?: string;
    responseInscriptionDate?: string;
    responseCheckDigit?: string;
    responseProof?: string;
    responseProofDate?: string;
    creditosConsumidos: number;
    origem: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedHubdoCpfHistory {
    items: HubdoCpfHistoryItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface HubdoCpfHistoryApiError {
    error: string;
}

export type HubdoCpfSearchResult = HubdoCpfLookupResponse;
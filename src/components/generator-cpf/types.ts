export interface GeneratedCpfRecord {
    cpf: string;
    formattedCpf: string;
    baseNineDigits: string;
    hubdoLookupId?: string | null;
    alreadyVerified?: boolean;
    hubdoLookup?: {
        id: string;
        requestStatus: 'OK' | 'NOK';
        queryMode: 'normal' | 'turbo';
        errorCode?: string;
        errorMessage?: string;
        responseName?: string;
        responseBirthDate?: string;
        responseCadastralStatus?: string;
        creditosConsumidos: number;
        origem: 'database' | 'receita_federal' | 'turbo';
        createdAt: string;
    } | null;
}

export interface GeneratorCpfApiResponse {
    records: GeneratedCpfRecord[];
}

export interface GeneratorCpfApiError {
    error: string;
}

export interface GeneratorCpfHistoryRecord {
    id: string;
    partialCpf: string;
    stateRegionDigit: string | null;
    resultRecords: GeneratedCpfRecord[];
    resultCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedGeneratorCpfHistory {
    items: GeneratorCpfHistoryRecord[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface BulkHubdoLookupItemResult {
    id: string;
    cpf: string;
    status: 'queued' | 'processing' | 'success' | 'error' | 'dead_letter';
    attemptCount: number;
    errorCode?: string;
    errorMessage?: string;
    creditosConsumidos: number;
    origin?: 'database' | 'receita_federal' | 'turbo';
    hubdoLookupId?: string | null;
}

export interface BulkHubdoLookupSummary {
    total: number;
    queued: number;
    processing: number;
    success: number;
    error: number;
}

export interface BulkHubdoLookupJobAcceptedResponse {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    summary: BulkHubdoLookupSummary;
}

export interface BulkHubdoLookupJobStatusResponse {
    job: {
        id: string;
        mode: 'normal' | 'turbo';
        status: 'queued' | 'processing' | 'completed' | 'failed';
        createdAt: string;
        updatedAt: string;
        finishedAt: string | null;
    };
    summary: BulkHubdoLookupSummary;
    items: BulkHubdoLookupItemResult[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export type BulkHubdoLookupResponse = BulkHubdoLookupJobStatusResponse;

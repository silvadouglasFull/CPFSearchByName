export interface GeneratedCpfRecord {
    cpf: string;
    formattedCpf: string;
    baseNineDigits: string;
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
    cpf: string;
    status: 'success' | 'error';
    errorCode?: string;
    message?: string;
    creditosConsumidos: number;
    origem?: 'database' | 'receita_federal' | 'turbo';
}

export interface BulkHubdoLookupSummary {
    total: number;
    success: number;
    error: number;
}

export interface BulkHubdoLookupResponse {
    summary: BulkHubdoLookupSummary;
    items: BulkHubdoLookupItemResult[];
}

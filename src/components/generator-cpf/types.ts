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

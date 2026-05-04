export interface PortalResultRecord {
    cpf: string;
    name?: string;
    relation?: string;
    detailsLink?: string;
    sourcePage?: number;
    [key: string]: unknown;
}

export interface FilterByCpfApiResponse {
    records: PortalResultRecord[];
}

export interface FilterByCpfApiError {
    error: string;
}

export interface FilterCpfHistoryRecord {
    id: string;
    searchTerm: string;
    resultRecords: PortalResultRecord[];
    resultCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface PaginatedFilterCpfHistory {
    items: FilterCpfHistoryRecord[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

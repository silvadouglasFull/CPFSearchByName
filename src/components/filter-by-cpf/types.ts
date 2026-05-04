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

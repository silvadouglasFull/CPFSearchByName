export interface PortalRecord {
    name: string;
    cpf: string;
    relation: string;
    detailsLink: string;
    sourcePage: number;
}

export interface GetCpfsByNameApiResponse {
    records: PortalRecord[];
}

export interface GetCpfsByNameApiError {
    error: string;
}

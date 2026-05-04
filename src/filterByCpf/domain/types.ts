export interface PortalResultRecord {
    name?: string;
    cpf: string;
    relation?: string;
    detailsLink?: string;
    sourcePage?: number;
    [key: string]: unknown;
}

export interface ResultsRepository {
    getAll(): PortalResultRecord[];
}

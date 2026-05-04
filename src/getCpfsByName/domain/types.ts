export interface RawPortalRecord {
    skPessoa: number;
    nome: string;
    cpfNis: string;
    descricaoRelacoesGovernoFederal: string;
}

export interface RawPortalPageResponse {
    registros: RawPortalRecord[];
}

export interface PortalRecord {
    name: string;
    cpf: string;
    relation: string;
    detailsLink: string;
    sourcePage: number;
}

export interface PortalSearchClient {
    openSearch(searchName: string): Promise<void>;
    collectPage(pageNumber: number): Promise<RawPortalPageResponse>;
    close(): Promise<void>;
}

export interface PortalResultsWriter {
    save(records: PortalRecord[]): string;
}

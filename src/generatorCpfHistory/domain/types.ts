import { GeneratedCpfRecord } from '@/generatorCpf/domain/types';

export interface GeneratorCpfHistoryRecord {
    id: string;
    partialCpf: string;
    stateRegionDigit: string | null;
    resultRecords: GeneratedCpfRecord[];
    resultCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface GeneratorCpfHistoryRecordLookupInfo {
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
    createdAt: Date;
}

export interface GeneratorCpfHistoryRecordWithLookup extends GeneratedCpfRecord {
    hubdoLookupId: string | null;
    alreadyVerified: boolean;
    hubdoLookup: GeneratorCpfHistoryRecordLookupInfo | null;
}

export interface GeneratorCpfHistoryDetailsWithLookup extends Omit<GeneratorCpfHistoryRecord, 'resultRecords'> {
    resultRecords: GeneratorCpfHistoryRecordWithLookup[];
}

export interface CreateGeneratorCpfHistoryInput {
    partialCpf: string;
    stateRegionDigit: string;
    resultRecords: GeneratedCpfRecord[];
}

export interface UpdateGeneratorCpfHistoryInput {
    partialCpf?: string;
    stateRegionDigit?: string | null;
    resultRecords?: GeneratedCpfRecord[];
}

export interface GeneratorCpfHistoryListParams {
    page: number;
    pageSize: number;
}

export interface PaginatedGeneratorCpfHistory {
    items: GeneratorCpfHistoryRecord[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface GeneratorCpfHistoryRepository {
    create(input: CreateGeneratorCpfHistoryInput): Promise<GeneratorCpfHistoryRecord>;
    getById(id: string): Promise<GeneratorCpfHistoryRecord | null>;
    listRecordsWithLookupByHistoryId(historyId: string): Promise<GeneratorCpfHistoryRecordWithLookup[]>;
    linkLookupForCpfRecords(cpf: string, hubdoLookupId: string): Promise<number>;
    update(id: string, updates: UpdateGeneratorCpfHistoryInput): Promise<GeneratorCpfHistoryRecord | null>;
    delete(id: string): Promise<boolean>;
    list(params: GeneratorCpfHistoryListParams): Promise<PaginatedGeneratorCpfHistory>;
}

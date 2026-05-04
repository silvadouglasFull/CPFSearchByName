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

export interface CreateGeneratorCpfHistoryInput {
    partialCpf: string;
    stateRegionDigit?: string | null;
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
    update(id: string, updates: UpdateGeneratorCpfHistoryInput): Promise<GeneratorCpfHistoryRecord | null>;
    delete(id: string): Promise<boolean>;
    list(params: GeneratorCpfHistoryListParams): Promise<PaginatedGeneratorCpfHistory>;
}

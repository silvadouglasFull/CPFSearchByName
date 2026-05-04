import { PortalResultRecord } from '@/filterByCpf/domain/types';

export interface FilterCpfHistoryRecord {
    id: string;
    searchTerm: string;
    resultRecords: PortalResultRecord[];
    resultCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateFilterCpfHistoryInput {
    searchTerm: string;
    resultRecords: PortalResultRecord[];
}

export interface UpdateFilterCpfHistoryInput {
    searchTerm?: string;
    resultRecords?: PortalResultRecord[];
}

export interface FilterCpfHistoryListParams {
    page: number;
    pageSize: number;
}

export interface PaginatedFilterCpfHistory {
    items: FilterCpfHistoryRecord[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface FilterCpfHistoryRepository {
    create(input: CreateFilterCpfHistoryInput): Promise<FilterCpfHistoryRecord>;
    getById(id: string): Promise<FilterCpfHistoryRecord | null>;
    update(id: string, updates: UpdateFilterCpfHistoryInput): Promise<FilterCpfHistoryRecord | null>;
    delete(id: string): Promise<boolean>;
    list(params: FilterCpfHistoryListParams): Promise<PaginatedFilterCpfHistory>;
}

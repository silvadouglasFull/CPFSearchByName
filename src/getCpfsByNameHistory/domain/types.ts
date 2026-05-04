import { PortalRecord } from '@/getCpfsByName/domain/types';

export interface GetCpfsByNameHistoryRecord {
    id: string;
    searchName: string;
    records: PortalRecord[];
    resultCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateGetCpfsByNameHistoryInput {
    searchName: string;
    records: PortalRecord[];
}

export interface UpdateGetCpfsByNameHistoryInput {
    searchName?: string;
    records?: PortalRecord[];
}

export interface GetCpfsByNameHistoryListParams {
    page: number;
    pageSize: number;
}

export interface PaginatedGetCpfsByNameHistory {
    items: GetCpfsByNameHistoryRecord[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface GetCpfsByNameHistoryRepository {
    create(input: CreateGetCpfsByNameHistoryInput): Promise<GetCpfsByNameHistoryRecord>;
    getById(id: string): Promise<GetCpfsByNameHistoryRecord | null>;
    update(id: string, updates: UpdateGetCpfsByNameHistoryInput): Promise<GetCpfsByNameHistoryRecord | null>;
    delete(id: string): Promise<boolean>;
    list(params: GetCpfsByNameHistoryListParams): Promise<PaginatedGetCpfsByNameHistory>;
}

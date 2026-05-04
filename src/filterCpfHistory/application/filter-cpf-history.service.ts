import {
    CreateFilterCpfHistoryInput,
    FilterCpfHistoryListParams,
    FilterCpfHistoryRecord,
    FilterCpfHistoryRepository,
    PaginatedFilterCpfHistory,
    UpdateFilterCpfHistoryInput,
} from '@/filterCpfHistory/domain/types';

export class FilterCpfHistoryService {
    constructor(private readonly repository: FilterCpfHistoryRepository) {}

    async create(input: CreateFilterCpfHistoryInput): Promise<FilterCpfHistoryRecord> {
        return this.repository.create(input);
    }

    async getById(id: string): Promise<FilterCpfHistoryRecord | null> {
        return this.repository.getById(id);
    }

    async update(id: string, updates: UpdateFilterCpfHistoryInput): Promise<FilterCpfHistoryRecord | null> {
        return this.repository.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }

    async list(params: FilterCpfHistoryListParams): Promise<PaginatedFilterCpfHistory> {
        return this.repository.list(params);
    }
}

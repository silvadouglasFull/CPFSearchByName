import {
    CreateGetCpfsByNameHistoryInput,
    GetCpfsByNameHistoryListParams,
    GetCpfsByNameHistoryRecord,
    GetCpfsByNameHistoryRepository,
    PaginatedGetCpfsByNameHistory,
    UpdateGetCpfsByNameHistoryInput,
} from '@/getCpfsByNameHistory/domain/types';

export class GetCpfsByNameHistoryService {
    constructor(private readonly repository: GetCpfsByNameHistoryRepository) {}

    async create(input: CreateGetCpfsByNameHistoryInput): Promise<GetCpfsByNameHistoryRecord> {
        return this.repository.create(input);
    }

    async getById(id: string): Promise<GetCpfsByNameHistoryRecord | null> {
        return this.repository.getById(id);
    }

    async update(id: string, updates: UpdateGetCpfsByNameHistoryInput): Promise<GetCpfsByNameHistoryRecord | null> {
        return this.repository.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }

    async list(params: GetCpfsByNameHistoryListParams): Promise<PaginatedGetCpfsByNameHistory> {
        return this.repository.list(params);
    }
}

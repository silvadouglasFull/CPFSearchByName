import {
    CreateGeneratorCpfHistoryInput,
    GeneratorCpfHistoryListParams,
    GeneratorCpfHistoryRecord,
    GeneratorCpfHistoryRepository,
    PaginatedGeneratorCpfHistory,
    UpdateGeneratorCpfHistoryInput,
} from '@/generatorCpfHistory/domain/types';

export class GeneratorCpfHistoryService {
    constructor(private readonly repository: GeneratorCpfHistoryRepository) {}

    async create(input: CreateGeneratorCpfHistoryInput): Promise<GeneratorCpfHistoryRecord> {
        return this.repository.create(input);
    }

    async getById(id: string): Promise<GeneratorCpfHistoryRecord | null> {
        return this.repository.getById(id);
    }

    async update(id: string, updates: UpdateGeneratorCpfHistoryInput): Promise<GeneratorCpfHistoryRecord | null> {
        return this.repository.update(id, updates);
    }

    async delete(id: string): Promise<boolean> {
        return this.repository.delete(id);
    }

    async list(params: GeneratorCpfHistoryListParams): Promise<PaginatedGeneratorCpfHistory> {
        return this.repository.list(params);
    }
}

import {
    CreateGeneratorCpfHistoryInput,
    GeneratorCpfHistoryDetailsWithLookup,
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

    async getByIdWithLookup(id: string): Promise<GeneratorCpfHistoryDetailsWithLookup | null> {
        const baseRecord = await this.repository.getById(id);

        if (!baseRecord) {
            return null;
        }

        const resultRecords = await this.repository.listRecordsWithLookupByHistoryId(id);

        return {
            ...baseRecord,
            resultRecords,
        };
    }

    async linkLookupForCpfRecords(cpf: string, hubdoLookupId: string): Promise<number> {
        return this.repository.linkLookupForCpfRecords(cpf, hubdoLookupId);
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

import { GeneratorCpfHistoryService } from '@/generatorCpfHistory/application/generator-cpf-history.service';
import { DrizzleGeneratorCpfHistoryRepository } from '@/generatorCpfHistory/infrastructure/drizzle-generator-cpf-history.repository';

export type {
    CreateGeneratorCpfHistoryInput,
    GeneratorCpfHistoryDetailsWithLookup,
    GeneratorCpfHistoryListParams,
    GeneratorCpfHistoryRecord,
    GeneratorCpfHistoryRecordLookupInfo,
    GeneratorCpfHistoryRecordWithLookup,
    GeneratorCpfHistoryRepository,
    PaginatedGeneratorCpfHistory,
    UpdateGeneratorCpfHistoryInput
} from '@/generatorCpfHistory/domain/types';
export { DrizzleGeneratorCpfHistoryRepository, GeneratorCpfHistoryService };

export function createGeneratorCpfHistoryService(): GeneratorCpfHistoryService {
    return new GeneratorCpfHistoryService(new DrizzleGeneratorCpfHistoryRepository());
}

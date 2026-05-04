import { FilterCpfHistoryService } from '@/filterCpfHistory/application/filter-cpf-history.service';
import { DrizzleFilterCpfHistoryRepository } from '@/filterCpfHistory/infrastructure/drizzle-filter-cpf-history.repository';

export type {
    CreateFilterCpfHistoryInput,
    FilterCpfHistoryListParams,
    FilterCpfHistoryRecord,
    FilterCpfHistoryRepository,
    PaginatedFilterCpfHistory,
    UpdateFilterCpfHistoryInput
} from '@/filterCpfHistory/domain/types';
export { DrizzleFilterCpfHistoryRepository, FilterCpfHistoryService };

export function createFilterCpfHistoryService(): FilterCpfHistoryService {
    return new FilterCpfHistoryService(new DrizzleFilterCpfHistoryRepository());
}

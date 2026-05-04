import { GetCpfsByNameHistoryService } from '@/getCpfsByNameHistory/application/get-cpfs-by-name-history.service';
import { DrizzleGetCpfsByNameHistoryRepository } from '@/getCpfsByNameHistory/infrastructure/drizzle-get-cpfs-by-name-history.repository';

export type {
    CreateGetCpfsByNameHistoryInput,
    GetCpfsByNameHistoryListParams,
    GetCpfsByNameHistoryRecord,
    GetCpfsByNameHistoryRepository,
    PaginatedGetCpfsByNameHistory,
    UpdateGetCpfsByNameHistoryInput
} from '@/getCpfsByNameHistory/domain/types';
export { DrizzleGetCpfsByNameHistoryRepository, GetCpfsByNameHistoryService };

export function createGetCpfsByNameHistoryService(): GetCpfsByNameHistoryService {
    return new GetCpfsByNameHistoryService(new DrizzleGetCpfsByNameHistoryRepository());
}

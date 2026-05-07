import { createGeneratorCpfHistoryService } from '@/generatorCpfHistory';
import { createHubdoBulkLookupRepository, createHubdoCpfLookupService } from '@/hubdoCpf';
import { startHubdoBulkConsumer } from '@/queue/rabbitmq/hubdo-bulk-consumer';

export async function startHubdoBulkLookupWorker(): Promise<void> {
    const hubdoLookupService = createHubdoCpfLookupService();
    const bulkRepository = createHubdoBulkLookupRepository();
    const generatorHistoryService = createGeneratorCpfHistoryService();

    await startHubdoBulkConsumer({
        hubdoLookupService,
        bulkRepository,
        generatorHistoryService,
    });
}

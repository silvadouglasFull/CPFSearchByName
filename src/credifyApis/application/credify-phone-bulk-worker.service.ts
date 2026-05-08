import { createCredifyPhoneJobRepository, createCredifyPhoneLookupService } from '@/credifyApis';
import { startCredifyPhoneConsumer } from '@/queue/rabbitmq/credify-phone-consumer';

export async function startCredifyPhoneBulkWorker(): Promise<void> {
    const lookupService = createCredifyPhoneLookupService();
    const jobRepository = createCredifyPhoneJobRepository();

    await startCredifyPhoneConsumer({
        lookupService,
        jobRepository,
    });
}

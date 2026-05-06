import { GeneratorCpfHistoryService } from '@/generatorCpfHistory';
import { HubdoCpfLookupService } from '@/hubdoCpf/application/hubdo-cpf-lookup.service';
import {
    HubdoBulkLookupQueueMessage,
    HubdoBulkLookupRepository,
} from '@/hubdoCpf/domain/bulk-lookup-types';
import { createRabbitMqChannel } from '@/queue/rabbitmq/connection';
import {
    getBulkMaxRetries,
    getBulkRetryDelayMs,
    getRabbitMqPrefetch,
    HUBDO_BULK_LOOKUP_QUEUE,
} from '@/queue/rabbitmq/constants';
import {
    publishHubdoBulkLookupDeadLetter,
    publishHubdoBulkLookupItem,
} from '@/queue/rabbitmq/publisher';

function isRetryableErrorCode(code?: string): boolean {
    return code === 'TIMEOUT' || code === 'SERVICE_UNAVAILABLE' || code === 'UNEXPECTED_ERROR';
}

async function delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startHubdoBulkConsumer(deps: {
    hubdoLookupService: HubdoCpfLookupService;
    bulkRepository: HubdoBulkLookupRepository;
    generatorHistoryService: GeneratorCpfHistoryService;
}): Promise<void> {
    const channel = await createRabbitMqChannel();
    await channel.prefetch(getRabbitMqPrefetch());

    await channel.consume(HUBDO_BULK_LOOKUP_QUEUE, async (rawMessage) => {
        if (!rawMessage) {
            return;
        }

        let parsed: HubdoBulkLookupQueueMessage | null = null;

        try {
            parsed = JSON.parse(rawMessage.content.toString('utf-8')) as HubdoBulkLookupQueueMessage;
        } catch {
            channel.ack(rawMessage);
            return;
        }

        try {
            await deps.bulkRepository.markItemProcessing(parsed.itemId, parsed.attempt);

            const lookupResult = await deps.hubdoLookupService.lookup({
                cpf: parsed.cpf,
                mode: parsed.mode,
            });

            const latestLookup = await deps.hubdoLookupService.listHistory({
                page: 1,
                pageSize: 1,
                cpf: parsed.cpf,
            });

            const latestLookupId = latestLookup.items[0]?.id;

            if (lookupResult.status === 'success') {
                await deps.bulkRepository.markItemSuccess({
                    itemId: parsed.itemId,
                    attemptCount: parsed.attempt,
                    creditosConsumidos: lookupResult.creditosConsumidos,
                    origin: lookupResult.origem,
                    hubdoLookupId: latestLookupId,
                });

                if (latestLookupId) {
                    await deps.generatorHistoryService.linkLookupForCpfRecords(parsed.cpf, latestLookupId);
                }

                channel.ack(rawMessage);
                return;
            }

            const retryable = isRetryableErrorCode(lookupResult.errorCode);
            const maxRetries = getBulkMaxRetries();

            if (retryable && parsed.attempt < maxRetries) {
                const nextAttempt = parsed.attempt + 1;

                await deps.bulkRepository.markItemQueued(
                    parsed.itemId,
                    nextAttempt,
                    lookupResult.errorCode,
                    lookupResult.message,
                );

                await delay(getBulkRetryDelayMs());
                await publishHubdoBulkLookupItem({
                    ...parsed,
                    attempt: nextAttempt,
                });

                channel.ack(rawMessage);
                return;
            }

            if (retryable && parsed.attempt >= maxRetries) {
                await deps.bulkRepository.markItemDeadLetter({
                    itemId: parsed.itemId,
                    attemptCount: parsed.attempt,
                    errorCode: lookupResult.errorCode,
                    errorMessage: lookupResult.message,
                });

                await publishHubdoBulkLookupDeadLetter(parsed);
                channel.ack(rawMessage);
                return;
            }

            await deps.bulkRepository.markItemError({
                itemId: parsed.itemId,
                attemptCount: parsed.attempt,
                errorCode: lookupResult.errorCode,
                errorMessage: lookupResult.message,
                creditosConsumidos: lookupResult.creditosConsumidos,
            });

            channel.ack(rawMessage);
        } catch {
            channel.nack(rawMessage, false, true);
        }
    });
}

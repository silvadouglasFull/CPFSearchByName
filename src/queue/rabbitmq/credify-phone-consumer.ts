import { CredifyPhoneLookupService } from '@/credifyApis/application/credify-phone-lookup.service';
import {
    CredifyPhoneJobRepository,
    CredifyPhoneQueueMessage,
} from '@/credifyApis/domain/types';
import { createRabbitMqChannel } from '@/queue/rabbitmq/connection';
import {
    CREDIFY_PHONE_LOOKUP_QUEUE,
    getCredifyMaxRetries,
    getCredifyRetryDelayMs,
    getRabbitMqPrefetch,
} from '@/queue/rabbitmq/constants';
import { publishCredifyPhoneDeadLetter, publishCredifyPhoneLookupItem } from '@/queue/rabbitmq/publisher';
import {
    emitCredifyPhoneItemUpdated,
    emitCredifyPhoneJobTerminal,
    emitCredifyPhoneJobUpdated,
} from '@/realtime/credify-phone-events';

function isRetryableError(code?: string): boolean {
    return code === 'CREDIFY_AUTH_TIMEOUT' || code === 'CREDIFY_LOOKUP_TIMEOUT' || code === 'CREDIFY_LOOKUP_FAILED';
}

async function delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startCredifyPhoneConsumer(deps: {
    lookupService: CredifyPhoneLookupService;
    jobRepository: CredifyPhoneJobRepository;
}): Promise<void> {
    const channel = await createRabbitMqChannel();
    await channel.prefetch(getRabbitMqPrefetch());

    async function emitJobProgress(jobId: string): Promise<void> {
        const status = await deps.jobRepository.getStatus({ jobId, page: 1, pageSize: 1 });
        if (!status) {
            return;
        }

        emitCredifyPhoneJobUpdated({
            jobId,
            status: status.job.status,
            summary: status.summary,
            updatedAt: new Date().toISOString(),
        });

        if (status.job.status === 'completed') {
            emitCredifyPhoneJobTerminal({
                jobId,
                status: 'completed',
                finalSummary: {
                    total: status.summary.total,
                    success: status.summary.success,
                    notFound: status.summary.notFound,
                    error: status.summary.error,
                    deadLetter: status.summary.deadLetter,
                },
                finishedAt: status.job.finishedAt?.toISOString() ?? new Date().toISOString(),
            });
        }
    }

    await channel.consume(CREDIFY_PHONE_LOOKUP_QUEUE, async (rawMessage) => {
        if (!rawMessage) {
            return;
        }

        let message: CredifyPhoneQueueMessage;

        try {
            message = JSON.parse(rawMessage.content.toString('utf-8')) as CredifyPhoneQueueMessage;
        } catch {
            channel.ack(rawMessage);
            return;
        }

        try {
            await deps.jobRepository.markItemProcessing(message.itemId, message.attempt);

            emitCredifyPhoneItemUpdated({
                jobId: message.jobId,
                itemId: message.itemId,
                normalizedPhone: message.normalizedPhone,
                status: 'processing',
                attemptCount: message.attempt,
                updatedAt: new Date().toISOString(),
                providerCode: null,
                errorCode: null,
                errorMessage: null,
            });

            const lookupResult = await deps.lookupService.process({
                jobId: message.jobId,
                itemId: message.itemId,
                rawPhone: message.rawPhone,
                normalizedPhone: message.normalizedPhone,
                ddd: message.ddd,
                localNumber: message.localNumber,
                providerQueryId: message.providerQueryId,
            });

            if (lookupResult.status === 'success') {
                await deps.jobRepository.markItemSuccess({
                    itemId: message.itemId,
                    attemptCount: message.attempt,
                    providerCode: lookupResult.providerCode,
                    lookupId: lookupResult.lookupId,
                });

                emitCredifyPhoneItemUpdated({
                    jobId: message.jobId,
                    itemId: message.itemId,
                    normalizedPhone: message.normalizedPhone,
                    status: 'success',
                    attemptCount: message.attempt,
                    updatedAt: new Date().toISOString(),
                    providerCode: lookupResult.providerCode,
                    errorCode: null,
                    errorMessage: null,
                });

                await emitJobProgress(message.jobId);
                channel.ack(rawMessage);
                return;
            }

            if (lookupResult.status === 'not_found') {
                await deps.jobRepository.markItemNotFound({
                    itemId: message.itemId,
                    attemptCount: message.attempt,
                    providerCode: lookupResult.providerCode,
                    lookupId: lookupResult.lookupId,
                });

                emitCredifyPhoneItemUpdated({
                    jobId: message.jobId,
                    itemId: message.itemId,
                    normalizedPhone: message.normalizedPhone,
                    status: 'not_found',
                    attemptCount: message.attempt,
                    updatedAt: new Date().toISOString(),
                    providerCode: lookupResult.providerCode,
                    errorCode: null,
                    errorMessage: null,
                });

                await emitJobProgress(message.jobId);
                channel.ack(rawMessage);
                return;
            }

            const retryable = isRetryableError(lookupResult.errorCode);
            const maxRetries = getCredifyMaxRetries();

            if (retryable && message.attempt < maxRetries) {
                const nextAttempt = message.attempt + 1;

                await deps.jobRepository.markItemQueued(
                    message.itemId,
                    nextAttempt,
                    lookupResult.errorCode,
                    lookupResult.errorMessage,
                );

                emitCredifyPhoneItemUpdated({
                    jobId: message.jobId,
                    itemId: message.itemId,
                    normalizedPhone: message.normalizedPhone,
                    status: 'queued',
                    attemptCount: nextAttempt,
                    updatedAt: new Date().toISOString(),
                    providerCode: lookupResult.providerCode,
                    errorCode: lookupResult.errorCode ?? null,
                    errorMessage: lookupResult.errorMessage ?? null,
                });

                await delay(getCredifyRetryDelayMs());
                await publishCredifyPhoneLookupItem({
                    ...message,
                    attempt: nextAttempt,
                });

                channel.ack(rawMessage);
                return;
            }

            if (retryable && message.attempt >= maxRetries) {
                await deps.jobRepository.markItemDeadLetter({
                    itemId: message.itemId,
                    attemptCount: message.attempt,
                    errorCode: lookupResult.errorCode,
                    errorMessage: lookupResult.errorMessage,
                });

                emitCredifyPhoneItemUpdated({
                    jobId: message.jobId,
                    itemId: message.itemId,
                    normalizedPhone: message.normalizedPhone,
                    status: 'dead_letter',
                    attemptCount: message.attempt,
                    updatedAt: new Date().toISOString(),
                    providerCode: lookupResult.providerCode,
                    errorCode: lookupResult.errorCode ?? null,
                    errorMessage: lookupResult.errorMessage ?? null,
                });

                await emitJobProgress(message.jobId);
                await publishCredifyPhoneDeadLetter(message);
                channel.ack(rawMessage);
                return;
            }

            await deps.jobRepository.markItemError({
                itemId: message.itemId,
                attemptCount: message.attempt,
                providerCode: lookupResult.providerCode,
                errorCode: lookupResult.errorCode,
                errorMessage: lookupResult.errorMessage,
                lookupId: lookupResult.lookupId,
            });

            emitCredifyPhoneItemUpdated({
                jobId: message.jobId,
                itemId: message.itemId,
                normalizedPhone: message.normalizedPhone,
                status: 'error',
                attemptCount: message.attempt,
                updatedAt: new Date().toISOString(),
                providerCode: lookupResult.providerCode,
                errorCode: lookupResult.errorCode ?? null,
                errorMessage: lookupResult.errorMessage ?? null,
            });

            await emitJobProgress(message.jobId);
            channel.ack(rawMessage);
        } catch {
            channel.nack(rawMessage, false, true);
        }
    });
}

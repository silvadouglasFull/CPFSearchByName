// @ts-nocheck
import { GeneratorCpfHistoryService } from '@/generatorCpfHistory';
import { HubdoCpfLookupService } from '@/hubdoCpf/application/hubdo-cpf-lookup.service';
import { HubdoBulkLookupFindMatchQueueMessage } from '@/hubdoCpf/domain/bulk-lookup-find-match-types';
import { HubdoBulkLookupRepository } from '@/hubdoCpf/domain/bulk-lookup-types';
import { normalizePersonName } from '@/hubdoCpf/domain/name-normalization';
import { createRabbitMqChannel } from '@/queue/rabbitmq/connection';
import {
    getBulkMaxRetries,
    getBulkRetryDelayMs,
    getRabbitMqPrefetch,
    HUBDO_BULK_LOOKUP_FIND_MATCH_QUEUE,
} from '@/queue/rabbitmq/constants';
import {
    publishHubdoBulkLookupFindMatchItem,
} from '@/queue/rabbitmq/publisher';
import {
    emitHubdoBulkFindMatchFound,
    emitHubdoBulkItemUpdated,
    emitHubdoBulkJobTerminal,
    emitHubdoBulkJobUpdated,
} from '@/realtime/hubdo-bulk-events';

function isRetryableErrorCode(code?: string): boolean {
    return code === 'TIMEOUT' || code === 'SERVICE_UNAVAILABLE' || code === 'UNEXPECTED_ERROR';
}

async function delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startHubdoBulkFindMatchConsumer(deps: {
    hubdoLookupService: HubdoCpfLookupService;
    bulkRepository: HubdoBulkLookupRepository;
    generatorHistoryService: GeneratorCpfHistoryService;
}): Promise<void> {
    const channel = await createRabbitMqChannel();
    await channel.prefetch(getRabbitMqPrefetch());

    const jobFoundStatusCache = new Map<string, boolean>();

    async function emitJobProgress(jobId: string): Promise<void> {
        const jobStatus = await deps.bulkRepository.getStatus({ jobId });
        if (!jobStatus) {
            return;
        }

        emitHubdoBulkJobUpdated({
            jobId,
            status: jobStatus.job.status as 'queued' | 'processing' | 'found' | 'completed' | 'failed',
            summary: jobStatus.summary,
            updatedAt: new Date().toISOString(),
        });

        if (jobStatus.job.status === 'completed' || jobStatus.job.status === 'found') {
            emitHubdoBulkJobTerminal({
                jobId,
                status: jobStatus.job.status as 'completed' | 'found',
                finalSummary: {
                    total: jobStatus.summary.total,
                    success: jobStatus.summary.success,
                    error: jobStatus.summary.error,
                    deadLetter: jobStatus.summary.deadLetter,
                },
                finishedAt: jobStatus.job.finishedAt?.toISOString() ?? new Date().toISOString(),
            });
        }
    }

    await channel.consume(HUBDO_BULK_LOOKUP_FIND_MATCH_QUEUE, async (rawMessage) => {
        if (!rawMessage) {
            return;
        }

        let parsed: HubdoBulkLookupFindMatchQueueMessage | null = null;

        try {
            parsed = JSON.parse(rawMessage.content.toString('utf-8'));
        } catch {
            channel.ack(rawMessage);
            return;
        }

        try {
            // Check if job already found (skip processing)
            const isAlreadyFound = jobFoundStatusCache.get(parsed.jobId) ?? false;

            if (isAlreadyFound) {
                await deps.bulkRepository.markItemSkipped(parsed.itemId);
                channel.ack(rawMessage);
                return;
            }

            // Mark as processing
            await deps.bulkRepository.markItemProcessing(parsed.itemId, parsed.attempt);

            // Emit item processing event
            emitHubdoBulkItemUpdated({
                jobId: parsed.jobId,
                itemId: parsed.itemId,
                cpf: parsed.cpf,
                status: 'processing',
                attemptCount: parsed.attempt,
                updatedAt: new Date().toISOString(),
                errorCode: null,
                errorMessage: null,
                creditosConsumidos: 0,
                origin: null,
            });

            // Call HubDo API
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

                const lookupName = lookupResult.nome?.trim();
                if (lookupName) {
                    const jobTarget = await deps.bulkRepository.getJobById(parsed.jobId);
                    if (jobTarget) {
                        const foundNameNormalized = normalizePersonName(lookupName);
                        const isMatch = foundNameNormalized === jobTarget.targetNameNormalized;

                        if (isMatch) {
                            // ✅ FOUND! Mark job and emit event
                            await deps.bulkRepository.markFindMatchJobAsFound(
                                parsed.jobId,
                                parsed.cpf,
                                lookupName,
                                lookupResult.dataNascimento ?? null,
                            );

                            // Mark all remaining items as skipped
                            await deps.bulkRepository.markFindMatchItemsAsSkipped(parsed.jobId);

                            // Cache it
                            jobFoundStatusCache.set(parsed.jobId, true);

                            // Emit realtime event
                            emitHubdoBulkFindMatchFound({
                                jobId: parsed.jobId,
                                foundCpf: parsed.cpf,
                                foundName: lookupName,
                                foundBirthDate: lookupResult.dataNascimento ?? null,
                            });

                            await emitJobProgress(parsed.jobId);

                            if (latestLookupId) {
                                await deps.generatorHistoryService.linkLookupForCpfRecords(parsed.cpf, latestLookupId);
                            }

                            channel.ack(rawMessage);
                            return;
                        }
                    }
                }

                // No match, emit success and continue
                emitHubdoBulkItemUpdated({
                    jobId: parsed.jobId,
                    itemId: parsed.itemId,
                    cpf: parsed.cpf,
                    status: 'success',
                    attemptCount: parsed.attempt,
                    updatedAt: new Date().toISOString(),
                    errorCode: null,
                    errorMessage: null,
                    creditosConsumidos: lookupResult.creditosConsumidos,
                    origin: lookupResult.origem,
                });

                await emitJobProgress(parsed.jobId);

                if (latestLookupId) {
                    await deps.generatorHistoryService.linkLookupForCpfRecords(parsed.cpf, latestLookupId);
                }

                channel.ack(rawMessage);
                return;
            }

            // Error handling (retry logic)
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

                // Emit item queued (retry) event
                emitHubdoBulkItemUpdated({
                    jobId: parsed.jobId,
                    itemId: parsed.itemId,
                    cpf: parsed.cpf,
                    status: 'queued',
                    attemptCount: nextAttempt,
                    updatedAt: new Date().toISOString(),
                    errorCode: lookupResult.errorCode ?? null,
                    errorMessage: lookupResult.message,
                    creditosConsumidos: 0,
                    origin: null,
                });

                await delay(getBulkRetryDelayMs());
                await publishHubdoBulkLookupFindMatchItem({
                    ...parsed,
                    attempt: nextAttempt,
                });

                channel.ack(rawMessage);
                return;
            }

            // Max retries exceeded
            if (retryable && parsed.attempt >= maxRetries) {
                await deps.bulkRepository.markItemDeadLetter({
                    itemId: parsed.itemId,
                    attemptCount: parsed.attempt,
                    errorCode: lookupResult.errorCode,
                    errorMessage: lookupResult.message,
                });

                // Emit item dead letter event
                emitHubdoBulkItemUpdated({
                    jobId: parsed.jobId,
                    itemId: parsed.itemId,
                    cpf: parsed.cpf,
                    status: 'dead_letter',
                    attemptCount: parsed.attempt,
                    updatedAt: new Date().toISOString(),
                    errorCode: lookupResult.errorCode ?? null,
                    errorMessage: lookupResult.message,
                    creditosConsumidos: 0,
                    origin: null,
                });

                await emitJobProgress(parsed.jobId);

                channel.ack(rawMessage);
                return;
            }

            // Non-retryable error
            await deps.bulkRepository.markItemError({
                itemId: parsed.itemId,
                attemptCount: parsed.attempt,
                errorCode: lookupResult.errorCode,
                errorMessage: lookupResult.message,
                creditosConsumidos: 0,
            });

            // Emit item error event
            emitHubdoBulkItemUpdated({
                jobId: parsed.jobId,
                itemId: parsed.itemId,
                cpf: parsed.cpf,
                status: 'error',
                attemptCount: parsed.attempt,
                updatedAt: new Date().toISOString(),
                errorCode: lookupResult.errorCode ?? null,
                errorMessage: lookupResult.message,
                creditosConsumidos: 0,
                origin: null,
            });

            await emitJobProgress(parsed.jobId);

            channel.ack(rawMessage);
        } catch (error) {
            console.error('[HubDo Find-Match Consumer] Error:', error);
            channel.nack(rawMessage, false, true); // requeue
        }
    });
}

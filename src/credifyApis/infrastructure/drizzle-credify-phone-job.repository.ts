import {
    CreateCredifyPhoneJobInput,
    CredifyPhoneJob,
    CredifyPhoneJobCreateResult,
    CredifyPhoneJobItem,
    CredifyPhoneJobRepository,
    CredifyPhoneJobStatusView,
    CredifyPhoneLookupStatus,
} from '@/credifyApis/domain/types';
import { db } from '@/database/db';
import {
    credifyPhoneLookupJobItems,
    credifyPhoneLookupJobs,
    credifyPhoneLookups,
} from '@/database/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export class DrizzleCredifyPhoneJobRepository implements CredifyPhoneJobRepository {
    async createJob(input: CreateCredifyPhoneJobInput): Promise<CredifyPhoneJobCreateResult> {
        return db.transaction(async (tx) => {
            const insertedJobs = await tx
                .insert(credifyPhoneLookupJobs)
                .values({
                    source: input.source,
                    status: 'queued',
                    totalItems: input.phones.length,
                    queuedItems: input.phones.length,
                    processingItems: 0,
                    successItems: 0,
                    notFoundItems: 0,
                    errorItems: 0,
                    deadLetterItems: 0,
                    createdBy: input.createdBy ?? null,
                })
                .returning();

            const jobRow = insertedJobs[0];
            if (!jobRow) {
                throw new Error('Failed to create Credify lookup job.');
            }

            const lookupRows = input.phones.length
                ? await tx
                    .insert(credifyPhoneLookups)
                    .values(
                        input.phones.map((phone) => ({
                            jobId: jobRow.id,
                            rawPhone: phone.rawPhone,
                            normalizedPhone: phone.normalizedPhone,
                            ddd: phone.ddd,
                            localNumber: phone.localNumber,
                            providerQueryId: phone.providerQueryId,
                            status: 'queued',
                        })),
                    )
                    .returning({
                        id: credifyPhoneLookups.id,
                        providerQueryId: credifyPhoneLookups.providerQueryId,
                    })
                : [];

            const lookupIdByProviderQueryId = new Map<string, string>(
                lookupRows.map((lookup) => [lookup.providerQueryId, lookup.id]),
            );

            const insertedItems = input.phones.length
                ? await tx
                    .insert(credifyPhoneLookupJobItems)
                    .values(
                        input.phones.map((phone) => ({
                            jobId: jobRow.id,
                            lookupId: lookupIdByProviderQueryId.get(phone.providerQueryId) ?? null,
                            rawPhone: phone.rawPhone,
                            normalizedPhone: phone.normalizedPhone,
                            ddd: phone.ddd,
                            localNumber: phone.localNumber,
                            status: 'queued',
                            attemptCount: 0,
                            providerQueryId: phone.providerQueryId,
                        })),
                    )
                    .returning()
                : [];

            const itemIdByProviderQueryId = new Map<string, string>(
                insertedItems.map((item) => [item.providerQueryId, item.id]),
            );

            if (itemIdByProviderQueryId.size > 0) {
                await Promise.all(
                    Array.from(itemIdByProviderQueryId.entries()).map(([providerQueryId, itemId]) =>
                        tx
                            .update(credifyPhoneLookups)
                            .set({
                                jobItemId: itemId,
                                updatedAt: new Date(),
                            })
                            .where(
                                and(
                                    eq(credifyPhoneLookups.jobId, jobRow.id),
                                    eq(credifyPhoneLookups.providerQueryId, providerQueryId),
                                ),
                            ),
                    ),
                );
            }

            const mappedJob = this.mapJob(jobRow);
            const mappedItems = insertedItems.map((item) => this.mapItem(item));

            return {
                job: mappedJob,
                items: mappedItems,
                summary: {
                    total: mappedJob.totalItems,
                    queued: mappedJob.queuedItems,
                    processing: mappedJob.processingItems,
                    success: mappedJob.successItems,
                    notFound: mappedJob.notFoundItems,
                    error: mappedJob.errorItems,
                    deadLetter: mappedJob.deadLetterItems,
                },
            };
        });
    }

    async getStatus(params: {
        jobId: string;
        page?: number;
        pageSize?: number;
        status?: CredifyPhoneLookupStatus;
    }): Promise<CredifyPhoneJobStatusView | null> {
        const page = Math.max(1, params.page ?? 1);
        const pageSize = Math.min(200, Math.max(1, params.pageSize ?? 50));
        const offset = (page - 1) * pageSize;

        const jobs = await db
            .select()
            .from(credifyPhoneLookupJobs)
            .where(eq(credifyPhoneLookupJobs.id, params.jobId))
            .limit(1);

        const job = jobs[0];
        if (!job) {
            return null;
        }

        const whereClause = params.status
            ? and(
                eq(credifyPhoneLookupJobItems.jobId, params.jobId),
                eq(credifyPhoneLookupJobItems.status, params.status),
            )
            : eq(credifyPhoneLookupJobItems.jobId, params.jobId);

        const itemRows = await db
            .select()
            .from(credifyPhoneLookupJobItems)
            .where(whereClause)
            .orderBy(desc(credifyPhoneLookupJobItems.createdAt))
            .limit(pageSize)
            .offset(offset);

        const totalRows = await db
            .select({ value: sql<number>`count(*)` })
            .from(credifyPhoneLookupJobItems)
            .where(whereClause);

        const totalItems = Number(totalRows[0]?.value ?? 0);
        const mappedJob = this.mapJob(job);

        return {
            job: mappedJob,
            summary: {
                total: mappedJob.totalItems,
                queued: mappedJob.queuedItems,
                processing: mappedJob.processingItems,
                success: mappedJob.successItems,
                notFound: mappedJob.notFoundItems,
                error: mappedJob.errorItems,
                deadLetter: mappedJob.deadLetterItems,
            },
            items: itemRows.map((item) => this.mapItem(item)),
            page,
            pageSize,
            totalItems,
            totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
        };
    }

    async markItemProcessing(itemId: string, attemptCount: number): Promise<void> {
        await this.updateItemAndRefresh(itemId, {
            status: 'processing',
            attemptCount,
            errorCode: null,
            errorMessage: null,
            providerCode: null,
            finishedAt: null,
        });
    }

    async markItemQueued(itemId: string, attemptCount: number, errorCode?: string, errorMessage?: string): Promise<void> {
        await this.updateItemAndRefresh(itemId, {
            status: 'queued',
            attemptCount,
            errorCode: errorCode ?? null,
            errorMessage: errorMessage ?? null,
            finishedAt: null,
        });
    }

    async markItemSuccess(input: {
        itemId: string;
        attemptCount: number;
        providerCode: string;
        lookupId?: string;
    }): Promise<void> {
        await this.updateItemAndRefresh(input.itemId, {
            status: 'success',
            attemptCount: input.attemptCount,
            providerCode: input.providerCode,
            lookupId: input.lookupId ?? null,
            errorCode: null,
            errorMessage: null,
            finishedAt: new Date(),
        });
    }

    async markItemNotFound(input: {
        itemId: string;
        attemptCount: number;
        providerCode: string;
        lookupId?: string;
    }): Promise<void> {
        await this.updateItemAndRefresh(input.itemId, {
            status: 'not_found',
            attemptCount: input.attemptCount,
            providerCode: input.providerCode,
            lookupId: input.lookupId ?? null,
            errorCode: null,
            errorMessage: null,
            finishedAt: new Date(),
        });
    }

    async markItemError(input: {
        itemId: string;
        attemptCount: number;
        providerCode?: string;
        errorCode?: string;
        errorMessage?: string;
        lookupId?: string;
    }): Promise<void> {
        await this.updateItemAndRefresh(input.itemId, {
            status: 'error',
            attemptCount: input.attemptCount,
            providerCode: input.providerCode ?? null,
            lookupId: input.lookupId ?? null,
            errorCode: input.errorCode ?? null,
            errorMessage: input.errorMessage ?? null,
            finishedAt: new Date(),
        });
    }

    async markItemDeadLetter(input: {
        itemId: string;
        attemptCount: number;
        errorCode?: string;
        errorMessage?: string;
    }): Promise<void> {
        await this.updateItemAndRefresh(input.itemId, {
            status: 'dead_letter',
            attemptCount: input.attemptCount,
            errorCode: input.errorCode ?? null,
            errorMessage: input.errorMessage ?? null,
            finishedAt: new Date(),
        });
    }

    private async updateItemAndRefresh(
        itemId: string,
        values: Partial<typeof credifyPhoneLookupJobItems.$inferInsert>,
    ): Promise<void> {
        await db.transaction(async (tx) => {
            const rows = await tx
                .update(credifyPhoneLookupJobItems)
                .set({
                    ...values,
                    updatedAt: new Date(),
                })
                .where(eq(credifyPhoneLookupJobItems.id, itemId))
                .returning({
                    jobId: credifyPhoneLookupJobItems.jobId,
                    providerQueryId: credifyPhoneLookupJobItems.providerQueryId,
                });

            const row = rows[0];
            if (!row) {
                return;
            }

            if (values.status && values.providerCode !== undefined) {
                await tx
                    .update(credifyPhoneLookups)
                    .set({
                        status: values.status,
                        providerCode: values.providerCode ?? null,
                        errorCode: values.errorCode ?? null,
                        errorMessage: values.errorMessage ?? null,
                        updatedAt: new Date(),
                        finishedAt: values.finishedAt ?? null,
                    })
                    .where(eq(credifyPhoneLookups.providerQueryId, row.providerQueryId));
            }

            await this.refreshJobCounters(tx, row.jobId);
        });
    }

    private async refreshJobCounters(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], jobId: string): Promise<void> {
        const counts = await tx
            .select({
                queued: sql<number>`count(*) filter (where ${credifyPhoneLookupJobItems.status} = 'queued')`,
                processing: sql<number>`count(*) filter (where ${credifyPhoneLookupJobItems.status} = 'processing')`,
                success: sql<number>`count(*) filter (where ${credifyPhoneLookupJobItems.status} = 'success')`,
                notFound: sql<number>`count(*) filter (where ${credifyPhoneLookupJobItems.status} = 'not_found')`,
                error: sql<number>`count(*) filter (where ${credifyPhoneLookupJobItems.status} = 'error')`,
                deadLetter: sql<number>`count(*) filter (where ${credifyPhoneLookupJobItems.status} = 'dead_letter')`,
            })
            .from(credifyPhoneLookupJobItems)
            .where(eq(credifyPhoneLookupJobItems.jobId, jobId));

        const values = counts[0];
        if (!values) {
            return;
        }

        const queued = Number(values.queued ?? 0);
        const processing = Number(values.processing ?? 0);
        const success = Number(values.success ?? 0);
        const notFound = Number(values.notFound ?? 0);
        const error = Number(values.error ?? 0);
        const deadLetter = Number(values.deadLetter ?? 0);

        const jobRows = await tx
            .select({ totalItems: credifyPhoneLookupJobs.totalItems })
            .from(credifyPhoneLookupJobs)
            .where(eq(credifyPhoneLookupJobs.id, jobId))
            .limit(1);

        const totalItems = Number(jobRows[0]?.totalItems ?? 0);
        const terminalCount = success + notFound + error + deadLetter;
        const allTerminal = totalItems > 0 && terminalCount >= totalItems;

        await tx
            .update(credifyPhoneLookupJobs)
            .set({
                status: allTerminal ? 'completed' : processing > 0 || terminalCount > 0 ? 'processing' : 'queued',
                queuedItems: queued,
                processingItems: processing,
                successItems: success,
                notFoundItems: notFound,
                errorItems: error,
                deadLetterItems: deadLetter,
                updatedAt: new Date(),
                finishedAt: allTerminal ? new Date() : null,
            })
            .where(eq(credifyPhoneLookupJobs.id, jobId));
    }

    private mapJob(row: typeof credifyPhoneLookupJobs.$inferSelect): CredifyPhoneJob {
        return {
            id: row.id,
            source: row.source,
            status: row.status as CredifyPhoneJob['status'],
            totalItems: row.totalItems,
            queuedItems: row.queuedItems,
            processingItems: row.processingItems,
            successItems: row.successItems,
            notFoundItems: row.notFoundItems,
            errorItems: row.errorItems,
            deadLetterItems: row.deadLetterItems,
            createdBy: row.createdBy ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            finishedAt: row.finishedAt ?? null,
        };
    }

    private mapItem(row: typeof credifyPhoneLookupJobItems.$inferSelect): CredifyPhoneJobItem {
        return {
            id: row.id,
            jobId: row.jobId,
            lookupId: row.lookupId ?? null,
            rawPhone: row.rawPhone,
            normalizedPhone: row.normalizedPhone,
            ddd: row.ddd,
            localNumber: row.localNumber,
            status: row.status as CredifyPhoneJobItem['status'],
            attemptCount: row.attemptCount,
            providerQueryId: row.providerQueryId,
            providerCode: row.providerCode ?? null,
            errorCode: row.errorCode ?? null,
            errorMessage: row.errorMessage ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            finishedAt: row.finishedAt ?? null,
        };
    }
}

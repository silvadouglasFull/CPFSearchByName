import { db } from '@/database/db';
import { hubdoBulkLookupJobItems, hubdoBulkLookupJobs } from '@/database/schema';
import {
    HubdoBulkLookupCreateJobInput,
    HubdoBulkLookupCreateJobResult,
    HubdoBulkLookupGetStatusParams,
    HubdoBulkLookupJob,
    HubdoBulkLookupJobItem,
    HubdoBulkLookupJobStatusView,
    HubdoBulkLookupRepository,
} from '@/hubdoCpf/domain/bulk-lookup-types';
import { and, desc, eq, sql } from 'drizzle-orm';

export class DrizzleHubdoBulkLookupRepository implements HubdoBulkLookupRepository {
    async createJob(input: HubdoBulkLookupCreateJobInput): Promise<HubdoBulkLookupCreateJobResult> {
        return db.transaction(async (tx) => {
            const insertedJobs = await tx
                .insert(hubdoBulkLookupJobs)
                .values({
                    mode: input.mode,
                    status: 'queued',
                    totalItems: input.cpfs.length,
                    queuedItems: input.cpfs.length,
                    processingItems: 0,
                    successItems: 0,
                    errorItems: 0,
                    deadLetterItems: 0,
                    requestedBy: input.requestedBy ?? null,
                })
                .returning();

            const job = insertedJobs[0];
            if (!job) {
                throw new Error('Failed to create HubDo bulk lookup job.');
            }

            const insertedItems = input.cpfs.length
                ? await tx
                    .insert(hubdoBulkLookupJobItems)
                    .values(
                        input.cpfs.map((cpf) => ({
                            jobId: job.id,
                            cpf,
                            status: 'queued',
                            attemptCount: 0,
                        })),
                    )
                    .returning()
                : [];

            const mappedJob = this.mapJob(job);
            const mappedItems = insertedItems.map((item) => this.mapItem(item));

            return {
                job: mappedJob,
                items: mappedItems,
                summary: {
                    total: mappedJob.totalItems,
                    queued: mappedJob.queuedItems,
                    processing: mappedJob.processingItems,
                    success: mappedJob.successItems,
                    error: mappedJob.errorItems,
                    deadLetter: mappedJob.deadLetterItems,
                },
            };
        });
    }

    async getStatus(params: HubdoBulkLookupGetStatusParams): Promise<HubdoBulkLookupJobStatusView | null> {
        const page = Math.max(1, params.page ?? 1);
        const pageSize = Math.min(200, Math.max(1, params.pageSize ?? 50));
        const offset = (page - 1) * pageSize;

        const jobs = await db
            .select()
            .from(hubdoBulkLookupJobs)
            .where(eq(hubdoBulkLookupJobs.id, params.jobId))
            .limit(1);

        const job = jobs[0];
        if (!job) {
            return null;
        }

        const whereCondition = params.status
            ? and(eq(hubdoBulkLookupJobItems.jobId, params.jobId), eq(hubdoBulkLookupJobItems.status, params.status))
            : eq(hubdoBulkLookupJobItems.jobId, params.jobId);

        const itemRows = await db
            .select()
            .from(hubdoBulkLookupJobItems)
            .where(whereCondition)
            .orderBy(desc(hubdoBulkLookupJobItems.createdAt))
            .limit(pageSize)
            .offset(offset);

        const totalRows = await db
            .select({ value: sql<number>`count(*)` })
            .from(hubdoBulkLookupJobItems)
            .where(whereCondition);

        const totalItems = Number(totalRows[0]?.value ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const mappedJob = this.mapJob(job);

        return {
            job: mappedJob,
            summary: {
                total: mappedJob.totalItems,
                queued: mappedJob.queuedItems,
                processing: mappedJob.processingItems,
                success: mappedJob.successItems,
                error: mappedJob.errorItems,
                deadLetter: mappedJob.deadLetterItems,
            },
            items: itemRows.map((row) => this.mapItem(row)),
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    async markItemProcessing(itemId: string, attemptCount: number): Promise<void> {
        await db.transaction(async (tx) => {
            const rows = await tx
                .update(hubdoBulkLookupJobItems)
                .set({
                    status: 'processing',
                    attemptCount,
                    updatedAt: new Date(),
                    errorCode: null,
                    errorMessage: null,
                    finishedAt: null,
                })
                .where(eq(hubdoBulkLookupJobItems.id, itemId))
                .returning({ jobId: hubdoBulkLookupJobItems.jobId });

            const jobId = rows[0]?.jobId;
            if (!jobId) {
                return;
            }

            await this.refreshJobCounters(tx, jobId);
        });
    }

    async markItemQueued(itemId: string, attemptCount: number, errorCode?: string, errorMessage?: string): Promise<void> {
        await db.transaction(async (tx) => {
            const rows = await tx
                .update(hubdoBulkLookupJobItems)
                .set({
                    status: 'queued',
                    attemptCount,
                    updatedAt: new Date(),
                    errorCode: errorCode ?? null,
                    errorMessage: errorMessage ?? null,
                    finishedAt: null,
                })
                .where(eq(hubdoBulkLookupJobItems.id, itemId))
                .returning({ jobId: hubdoBulkLookupJobItems.jobId });

            const jobId = rows[0]?.jobId;
            if (!jobId) {
                return;
            }

            await this.refreshJobCounters(tx, jobId);
        });
    }

    async markItemSuccess(input: {
        itemId: string;
        attemptCount: number;
        creditosConsumidos: number;
        origin?: string;
        hubdoLookupId?: string;
    }): Promise<void> {
        await db.transaction(async (tx) => {
            const rows = await tx
                .update(hubdoBulkLookupJobItems)
                .set({
                    status: 'success',
                    attemptCount: input.attemptCount,
                    creditosConsumidos: input.creditosConsumidos,
                    origin: input.origin ?? null,
                    hubdoLookupId: input.hubdoLookupId ?? null,
                    updatedAt: new Date(),
                    finishedAt: new Date(),
                    errorCode: null,
                    errorMessage: null,
                })
                .where(eq(hubdoBulkLookupJobItems.id, input.itemId))
                .returning({ jobId: hubdoBulkLookupJobItems.jobId });

            const jobId = rows[0]?.jobId;
            if (!jobId) {
                return;
            }

            await this.refreshJobCounters(tx, jobId);
        });
    }

    async markItemError(input: {
        itemId: string;
        attemptCount: number;
        errorCode?: string;
        errorMessage?: string;
        creditosConsumidos?: number;
    }): Promise<void> {
        await db.transaction(async (tx) => {
            const rows = await tx
                .update(hubdoBulkLookupJobItems)
                .set({
                    status: 'error',
                    attemptCount: input.attemptCount,
                    errorCode: input.errorCode ?? null,
                    errorMessage: input.errorMessage ?? null,
                    creditosConsumidos: input.creditosConsumidos ?? 0,
                    updatedAt: new Date(),
                    finishedAt: new Date(),
                })
                .where(eq(hubdoBulkLookupJobItems.id, input.itemId))
                .returning({ jobId: hubdoBulkLookupJobItems.jobId });

            const jobId = rows[0]?.jobId;
            if (!jobId) {
                return;
            }

            await this.refreshJobCounters(tx, jobId);
        });
    }

    async markItemDeadLetter(input: {
        itemId: string;
        attemptCount: number;
        errorCode?: string;
        errorMessage?: string;
    }): Promise<void> {
        await db.transaction(async (tx) => {
            const rows = await tx
                .update(hubdoBulkLookupJobItems)
                .set({
                    status: 'dead_letter',
                    attemptCount: input.attemptCount,
                    errorCode: input.errorCode ?? null,
                    errorMessage: input.errorMessage ?? null,
                    updatedAt: new Date(),
                    finishedAt: new Date(),
                })
                .where(eq(hubdoBulkLookupJobItems.id, input.itemId))
                .returning({ jobId: hubdoBulkLookupJobItems.jobId });

            const jobId = rows[0]?.jobId;
            if (!jobId) {
                return;
            }

            await this.refreshJobCounters(tx, jobId);
        });
    }

    private async refreshJobCounters(tx: Parameters<Parameters<typeof db.transaction>[0]>[0], jobId: string): Promise<void> {
        const counts = await tx
            .select({
                queued: sql<number>`count(*) filter (where ${hubdoBulkLookupJobItems.status} = 'queued')`,
                processing: sql<number>`count(*) filter (where ${hubdoBulkLookupJobItems.status} = 'processing')`,
                success: sql<number>`count(*) filter (where ${hubdoBulkLookupJobItems.status} = 'success')`,
                error: sql<number>`count(*) filter (where ${hubdoBulkLookupJobItems.status} = 'error')`,
                deadLetter: sql<number>`count(*) filter (where ${hubdoBulkLookupJobItems.status} = 'dead_letter')`,
            })
            .from(hubdoBulkLookupJobItems)
            .where(eq(hubdoBulkLookupJobItems.jobId, jobId));

        const values = counts[0];
        if (!values) {
            return;
        }

        const queued = Number(values.queued ?? 0);
        const processing = Number(values.processing ?? 0);
        const success = Number(values.success ?? 0);
        const error = Number(values.error ?? 0);
        const deadLetter = Number(values.deadLetter ?? 0);
        const terminal = success + error + deadLetter;

        const jobRows = await tx
            .select({ totalItems: hubdoBulkLookupJobs.totalItems })
            .from(hubdoBulkLookupJobs)
            .where(eq(hubdoBulkLookupJobs.id, jobId))
            .limit(1);

        const totalItems = Number(jobRows[0]?.totalItems ?? 0);
        const allTerminal = totalItems > 0 && terminal >= totalItems;

        await tx
            .update(hubdoBulkLookupJobs)
            .set({
                status: allTerminal ? 'completed' : processing > 0 || terminal > 0 ? 'processing' : 'queued',
                queuedItems: queued,
                processingItems: processing,
                successItems: success,
                errorItems: error,
                deadLetterItems: deadLetter,
                updatedAt: new Date(),
                finishedAt: allTerminal ? new Date() : null,
            })
            .where(eq(hubdoBulkLookupJobs.id, jobId));
    }

    private mapJob(row: typeof hubdoBulkLookupJobs.$inferSelect): HubdoBulkLookupJob {
        return {
            id: row.id,
            mode: row.mode as 'normal' | 'turbo',
            status: row.status as 'queued' | 'processing' | 'completed' | 'failed',
            totalItems: row.totalItems,
            queuedItems: row.queuedItems,
            processingItems: row.processingItems,
            successItems: row.successItems,
            errorItems: row.errorItems,
            deadLetterItems: row.deadLetterItems,
            requestedBy: row.requestedBy ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            finishedAt: row.finishedAt ?? null,
        };
    }

    private mapItem(row: typeof hubdoBulkLookupJobItems.$inferSelect): HubdoBulkLookupJobItem {
        return {
            id: row.id,
            jobId: row.jobId,
            cpf: row.cpf,
            status: row.status as 'queued' | 'processing' | 'success' | 'error' | 'dead_letter',
            attemptCount: row.attemptCount,
            errorCode: row.errorCode ?? null,
            errorMessage: row.errorMessage ?? null,
            creditosConsumidos: row.creditosConsumidos,
            origin: row.origin ?? null,
            hubdoLookupId: row.hubdoLookupId ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            finishedAt: row.finishedAt ?? null,
        };
    }
}

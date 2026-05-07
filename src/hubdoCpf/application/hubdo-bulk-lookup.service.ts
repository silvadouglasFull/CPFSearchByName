import {
    HubdoBulkLookupCreateJobResult,
    HubdoBulkLookupGetStatusParams,
    HubdoBulkLookupJobStatusView,
    HubdoBulkLookupMode,
    HubdoBulkLookupRepository,
} from '@/hubdoCpf/domain/bulk-lookup-types';
import { normalizePersonName } from '@/hubdoCpf/domain/name-normalization';
import { publishHubdoBulkLookupItem } from '@/queue/rabbitmq/publisher';
import { normalizeCpf } from '@/security/cpf-protection';

export class HubdoBulkLookupService {
    constructor(private readonly repository: HubdoBulkLookupRepository) { }

    async enqueueBulkJob(input: {
        cpfs: string[];
        mode: HubdoBulkLookupMode;
        targetName: string;
        requestedBy?: string;
    }): Promise<HubdoBulkLookupCreateJobResult> {
        const targetName = input.targetName.trim();
        if (!targetName) {
            throw new Error('Target name is required.');
        }

        const targetNameNormalized = normalizePersonName(targetName);
        const normalizedCpfs = Array.from(
            new Set(
                input.cpfs
                    .map((cpf) => normalizeCpf(cpf))
                    .filter((cpf) => cpf.length > 0),
            ),
        );

        const excludedCpfs = await this.repository.getExcludedCpfsForTargetName(targetNameNormalized);
        const excludedSet = new Set(excludedCpfs);
        const cpfsToQueue = normalizedCpfs.filter((cpf) => !excludedSet.has(cpf));

        const created = await this.repository.createJob({
            cpfs: cpfsToQueue,
            mode: input.mode,
            targetName,
            targetNameNormalized,
            requestedBy: input.requestedBy,
        });

        await Promise.all(
            created.items.map((item) =>
                publishHubdoBulkLookupItem({
                    jobId: created.job.id,
                    itemId: item.id,
                    cpf: item.cpf,
                    mode: created.job.mode,
                    attempt: 1,
                }),
            ),
        );

        return created;
    }

    async enqueueBulkJobSimple(input: {
        cpfs: string[];
        mode: HubdoBulkLookupMode;
        requestedBy?: string;
    }): Promise<HubdoBulkLookupCreateJobResult> {
        const normalizedCpfs = Array.from(
            new Set(
                input.cpfs
                    .map((cpf) => normalizeCpf(cpf))
                    .filter((cpf) => cpf.length > 0),
            ),
        );

        if (normalizedCpfs.length === 0) {
            throw new Error('No valid CPF values were provided.');
        }

        // Use a placeholder for simple bulk (no name matching)
        const SIMPLE_BULK_MARKER = '__SIMPLE_BULK_MODE__';

        const created = await this.repository.createJob({
            cpfs: normalizedCpfs,
            mode: input.mode,
            targetName: SIMPLE_BULK_MARKER,
            targetNameNormalized: SIMPLE_BULK_MARKER,
            requestedBy: input.requestedBy,
        });

        await Promise.all(
            created.items.map((item) =>
                publishHubdoBulkLookupItem({
                    jobId: created.job.id,
                    itemId: item.id,
                    cpf: item.cpf,
                    mode: created.job.mode,
                    attempt: 1,
                }),
            ),
        );

        return created;
    }

    async enqueueBulkJobFindMatch(input: {
        cpfs: string[];
        mode: HubdoBulkLookupMode;
        targetName: string;
        requestedBy?: string;
    }): Promise<HubdoBulkLookupCreateJobResult> {
        const targetName = input.targetName.trim();
        if (!targetName) {
            throw new Error('Target name is required for find-match mode.');
        }

        const targetNameNormalized = normalizePersonName(targetName);
        const normalizedCpfs = Array.from(
            new Set(
                input.cpfs
                    .map((cpf) => normalizeCpf(cpf))
                    .filter((cpf) => cpf.length > 0),
            ),
        );

        if (normalizedCpfs.length === 0) {
            throw new Error('No valid CPF values were provided.');
        }

        // Create find-match job (NO exclusion filtering - search all)
        const created = await this.repository.createFindMatchJob({
            cpfs: normalizedCpfs,
            mode: input.mode,
            targetName,
            targetNameNormalized,
            requestedBy: input.requestedBy,
        });

        // Import will be added: publishHubdoBulkLookupFindMatchItem
        const { publishHubdoBulkLookupFindMatchItem } = await import('@/queue/rabbitmq/publisher');

        await Promise.all(
            created.items.map((item) =>
                publishHubdoBulkLookupFindMatchItem({
                    jobId: created.job.id,
                    itemId: item.id,
                    cpf: item.cpf,
                    mode: created.job.mode,
                    attempt: 1,
                }),
            ),
        );

        return created;
    }

    async getJobStatus(params: HubdoBulkLookupGetStatusParams): Promise<HubdoBulkLookupJobStatusView | null> {
        return this.repository.getStatus(params);
    }
}

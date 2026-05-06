import {
    HubdoBulkLookupCreateJobResult,
    HubdoBulkLookupGetStatusParams,
    HubdoBulkLookupJobStatusView,
    HubdoBulkLookupMode,
    HubdoBulkLookupRepository,
} from '@/hubdoCpf/domain/bulk-lookup-types';
import { publishHubdoBulkLookupItem } from '@/queue/rabbitmq/publisher';
import { normalizeCpf } from '@/security/cpf-protection';

export class HubdoBulkLookupService {
    constructor(private readonly repository: HubdoBulkLookupRepository) { }

    async enqueueBulkJob(input: {
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

        const created = await this.repository.createJob({
            cpfs: normalizedCpfs,
            mode: input.mode,
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

    async getJobStatus(params: HubdoBulkLookupGetStatusParams): Promise<HubdoBulkLookupJobStatusView | null> {
        return this.repository.getStatus(params);
    }
}

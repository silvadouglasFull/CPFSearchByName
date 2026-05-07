import { HubdoBulkLookupMode } from './bulk-lookup-types';

export type HubdoBulkLookupFindMatchJobStatus = 'queued' | 'processing' | 'found' | 'completed' | 'failed';

export interface HubdoBulkLookupFindMatchQueueMessage {
    jobId: string;
    itemId: string;
    cpf: string;
    mode: HubdoBulkLookupMode;
    attempt: number;
}

export interface HubdoBulkLookupFindMatchCreateJobInput {
    cpfs: string[];
    mode: HubdoBulkLookupMode;
    targetName: string;
    targetNameNormalized: string;
    requestedBy?: string;
}

export interface HubdoBulkLookupFindMatchJob {
    id: string;
    mode: HubdoBulkLookupMode;
    targetName: string;
    targetNameNormalized: string;
    status: HubdoBulkLookupFindMatchJobStatus;
    totalItems: number;
    queuedItems: number;
    processingItems: number;
    successItems: number;
    errorItems: number;
    skippedItems: number;
    foundCpf: string | null;
    foundName: string | null;
    foundBirthDate: string | null;
    requestedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    finishedAt: Date | null;
}

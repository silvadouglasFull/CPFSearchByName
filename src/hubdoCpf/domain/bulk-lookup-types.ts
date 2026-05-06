export type HubdoBulkLookupMode = 'normal' | 'turbo';

export type HubdoBulkLookupJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export type HubdoBulkLookupItemStatus = 'queued' | 'processing' | 'success' | 'error' | 'dead_letter';

export interface HubdoBulkLookupQueueMessage {
    jobId: string;
    itemId: string;
    cpf: string;
    mode: HubdoBulkLookupMode;
    attempt: number;
}

export interface HubdoBulkLookupJob {
    id: string;
    mode: HubdoBulkLookupMode;
    status: HubdoBulkLookupJobStatus;
    totalItems: number;
    queuedItems: number;
    processingItems: number;
    successItems: number;
    errorItems: number;
    deadLetterItems: number;
    requestedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    finishedAt: Date | null;
}

export interface HubdoBulkLookupJobItem {
    id: string;
    jobId: string;
    cpf: string;
    status: HubdoBulkLookupItemStatus;
    attemptCount: number;
    errorCode: string | null;
    errorMessage: string | null;
    creditosConsumidos: number;
    origin: string | null;
    hubdoLookupId: string | null;
    createdAt: Date;
    updatedAt: Date;
    finishedAt: Date | null;
}

export interface HubdoBulkLookupCreateJobInput {
    cpfs: string[];
    mode: HubdoBulkLookupMode;
    requestedBy?: string;
}

export interface HubdoBulkLookupJobSummary {
    total: number;
    queued: number;
    processing: number;
    success: number;
    error: number;
    deadLetter: number;
}

export interface HubdoBulkLookupCreateJobResult {
    job: HubdoBulkLookupJob;
    items: HubdoBulkLookupJobItem[];
    summary: HubdoBulkLookupJobSummary;
}

export interface HubdoBulkLookupGetStatusParams {
    jobId: string;
    page?: number;
    pageSize?: number;
    status?: HubdoBulkLookupItemStatus;
}

export interface HubdoBulkLookupJobStatusView {
    job: HubdoBulkLookupJob;
    summary: HubdoBulkLookupJobSummary;
    items: HubdoBulkLookupJobItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface HubdoBulkLookupRepository {
    createJob(input: HubdoBulkLookupCreateJobInput): Promise<HubdoBulkLookupCreateJobResult>;
    getStatus(params: HubdoBulkLookupGetStatusParams): Promise<HubdoBulkLookupJobStatusView | null>;
    markItemProcessing(itemId: string, attemptCount: number): Promise<void>;
    markItemQueued(itemId: string, attemptCount: number, errorCode?: string, errorMessage?: string): Promise<void>;
    markItemSuccess(input: {
        itemId: string;
        attemptCount: number;
        creditosConsumidos: number;
        origin?: string;
        hubdoLookupId?: string;
    }): Promise<void>;
    markItemError(input: {
        itemId: string;
        attemptCount: number;
        errorCode?: string;
        errorMessage?: string;
        creditosConsumidos?: number;
    }): Promise<void>;
    markItemDeadLetter(input: {
        itemId: string;
        attemptCount: number;
        errorCode?: string;
        errorMessage?: string;
    }): Promise<void>;
}

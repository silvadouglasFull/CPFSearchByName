export type CredifyPhoneLookupStatus = 'queued' | 'processing' | 'success' | 'not_found' | 'error' | 'dead_letter';

export type CredifyPhoneJobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface CredifyAuthResponse {
    Success: boolean;
    Message: string;
    Dados: string;
}

export interface CredifyPhoneLookupRequest {
    rawPhone: string;
    normalizedPhone: string;
    ddd: string;
    localNumber: string;
    providerQueryId: string;
}

export interface CredifyPhoneLookupResult {
    status: 'success' | 'not_found' | 'error';
    providerCode: string;
    providerMessage?: string;
    cpf?: string;
    nome?: string;
    tpLogradouro?: string;
    logradouro?: string;
    numero?: string;
    endereco?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
    phoneType?: string;
    rawResponse?: unknown;
}

export interface CreateCredifyPhoneLookupInput {
    jobId?: string;
    jobItemId?: string;
    rawPhone: string;
    normalizedPhone: string;
    ddd: string;
    localNumber: string;
    providerQueryId: string;
    status: CredifyPhoneLookupStatus;
    providerCode?: string;
    providerMessage?: string;
    cpf?: string;
    nome?: string;
    tpLogradouro?: string;
    logradouro?: string;
    numero?: string;
    endereco?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
    phoneType?: string;
    errorCode?: string;
    errorMessage?: string;
    rawResponse?: unknown;
    finishedAt?: Date;
}

export interface CredifyPhoneLookupRecord extends CreateCredifyPhoneLookupInput {
    id: string;
    jobId?: string;
    jobItemId?: string;
    providerCode?: string;
    providerMessage?: string;
    cpf?: string;
    nome?: string;
    tpLogradouro?: string;
    logradouro?: string;
    numero?: string;
    endereco?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
    phoneType?: string;
    errorCode?: string;
    errorMessage?: string;
    rawResponse?: unknown;
    finishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface CredifyPhoneLookupHistoryParams {
    page: number;
    pageSize: number;
    phone?: string;
    status?: 'success' | 'not_found' | 'error';
}

export interface PaginatedCredifyPhoneLookupHistory {
    items: CredifyPhoneLookupRecord[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface CredifyPhoneLookupRepository {
    save(input: CreateCredifyPhoneLookupInput): Promise<CredifyPhoneLookupRecord>;
    getByProviderQueryId(providerQueryId: string): Promise<CredifyPhoneLookupRecord | null>;
    list(params: CredifyPhoneLookupHistoryParams): Promise<PaginatedCredifyPhoneLookupHistory>;
}

export interface CredifyPhoneQueueMessage {
    jobId: string;
    itemId: string;
    rawPhone: string;
    normalizedPhone: string;
    ddd: string;
    localNumber: string;
    providerQueryId: string;
    attempt: number;
}

export interface CredifyPhoneJobSummary {
    total: number;
    queued: number;
    processing: number;
    success: number;
    notFound: number;
    error: number;
    deadLetter: number;
}

export interface CredifyPhoneJob {
    id: string;
    source: string;
    status: CredifyPhoneJobStatus;
    totalItems: number;
    queuedItems: number;
    processingItems: number;
    successItems: number;
    notFoundItems: number;
    errorItems: number;
    deadLetterItems: number;
    createdBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    finishedAt: Date | null;
}

export interface CredifyPhoneJobItem {
    id: string;
    jobId: string;
    lookupId: string | null;
    rawPhone: string;
    normalizedPhone: string;
    ddd: string;
    localNumber: string;
    status: CredifyPhoneLookupStatus;
    attemptCount: number;
    providerQueryId: string;
    providerCode: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    createdAt: Date;
    updatedAt: Date;
    finishedAt: Date | null;
}

export interface CreateCredifyPhoneJobInput {
    source: string;
    createdBy?: string;
    phones: Array<{
        rawPhone: string;
        normalizedPhone: string;
        ddd: string;
        localNumber: string;
        providerQueryId: string;
    }>;
}

export interface CredifyPhoneJobCreateResult {
    job: CredifyPhoneJob;
    items: CredifyPhoneJobItem[];
    summary: CredifyPhoneJobSummary;
}

export interface CredifyPhoneJobStatusParams {
    jobId: string;
    page?: number;
    pageSize?: number;
    status?: CredifyPhoneLookupStatus;
}

export interface CredifyPhoneJobStatusView {
    job: CredifyPhoneJob;
    summary: CredifyPhoneJobSummary;
    items: CredifyPhoneJobItem[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

export interface CredifyPhoneJobRepository {
    createJob(input: CreateCredifyPhoneJobInput): Promise<CredifyPhoneJobCreateResult>;
    getStatus(params: CredifyPhoneJobStatusParams): Promise<CredifyPhoneJobStatusView | null>;
    markItemProcessing(itemId: string, attemptCount: number): Promise<void>;
    markItemQueued(itemId: string, attemptCount: number, errorCode?: string, errorMessage?: string): Promise<void>;
    markItemSuccess(input: {
        itemId: string;
        attemptCount: number;
        providerCode: string;
        lookupId?: string;
    }): Promise<void>;
    markItemNotFound(input: {
        itemId: string;
        attemptCount: number;
        providerCode: string;
        lookupId?: string;
    }): Promise<void>;
    markItemError(input: {
        itemId: string;
        attemptCount: number;
        providerCode?: string;
        errorCode?: string;
        errorMessage?: string;
        lookupId?: string;
    }): Promise<void>;
    markItemDeadLetter(input: {
        itemId: string;
        attemptCount: number;
        errorCode?: string;
        errorMessage?: string;
    }): Promise<void>;
}

export class CredifyApiError extends Error {
    constructor(public code: string, message: string) {
        super(message);
        this.name = 'CredifyApiError';
        Object.setPrototypeOf(this, CredifyApiError.prototype);
    }
}

export type CredifyPhoneItemStatus = 'queued' | 'processing' | 'success' | 'not_found' | 'error' | 'dead_letter';

export interface CredifyPhoneJobSummary {
    total: number;
    queued: number;
    processing: number;
    success: number;
    notFound: number;
    error: number;
    deadLetter: number;
}

export interface CredifyPhoneItem {
    id: string;
    normalizedPhone: string;
    status: CredifyPhoneItemStatus;
    attemptCount: number;
    providerCode: string | null;
    errorCode: string | null;
    errorMessage: string | null;
    updatedAt: string;
}

export interface CredifyPhoneLookupHistoryRecord {
    id: string;
    rawPhone: string;
    normalizedPhone: string;
    status: CredifyPhoneItemStatus;
    providerCode?: string;
    nome?: string;
    cpf?: string;
    errorMessage?: string;
    createdAt: string;
}

export interface PaginatedCredifyPhoneLookupHistory {
    items: CredifyPhoneLookupHistoryRecord[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

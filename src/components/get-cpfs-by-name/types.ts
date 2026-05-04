export interface PortalRecord {
    name: string;
    cpf: string;
    relation: string;
    detailsLink: string;
    sourcePage: number;
}

export interface ProgressEvent {
    type: 'progress';
    currentPage: number;
    totalPages: number;
}

export interface PageEvent {
    type: 'page';
    currentPage: number;
    totalPages: number;
    records: PortalRecord[];
}

export interface PageErrorEvent {
    type: 'page_error';
    currentPage: number;
    totalPages: number;
    message: string;
}

export interface DoneEvent {
    type: 'done';
    totalRecords: number;
}

export interface FatalErrorEvent {
    type: 'error';
    message: string;
}

export type CollectionEvent =
    | ProgressEvent
    | PageEvent
    | PageErrorEvent
    | DoneEvent
    | FatalErrorEvent;

export type PageStatus =
    | { state: 'idle' }
    | { state: 'collecting' }
    | { state: 'done'; count: number }
    | { state: 'error'; message: string };

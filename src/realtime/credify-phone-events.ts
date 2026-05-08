import { getSocketIOServer } from '@/realtime/socket-server';

export interface CredifyPhoneItemUpdatedEvent {
    jobId: string;
    itemId: string;
    normalizedPhone: string;
    status: 'queued' | 'processing' | 'success' | 'not_found' | 'error' | 'dead_letter';
    attemptCount: number;
    updatedAt: string;
    providerCode: string | null;
    errorCode: string | null;
    errorMessage: string | null;
}

export interface CredifyPhoneJobUpdatedEvent {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    summary: {
        total: number;
        queued: number;
        processing: number;
        success: number;
        notFound: number;
        error: number;
        deadLetter: number;
    };
    updatedAt: string;
}

export interface CredifyPhoneJobTerminalEvent {
    jobId: string;
    status: 'completed' | 'failed';
    finalSummary: {
        total: number;
        success: number;
        notFound: number;
        error: number;
        deadLetter: number;
    };
    finishedAt: string;
}

export function emitCredifyPhoneItemUpdated(event: CredifyPhoneItemUpdatedEvent): void {
    const io = getSocketIOServer();
    if (!io) {
        return;
    }

    io.of('/credify-phone-lookup').to(`credify:phone:job:${event.jobId}`).emit('credify.phone.item.updated', event);
}

export function emitCredifyPhoneJobUpdated(event: CredifyPhoneJobUpdatedEvent): void {
    const io = getSocketIOServer();
    if (!io) {
        return;
    }

    io.of('/credify-phone-lookup').to(`credify:phone:job:${event.jobId}`).emit('credify.phone.job.updated', event);
}

export function emitCredifyPhoneJobTerminal(event: CredifyPhoneJobTerminalEvent): void {
    const io = getSocketIOServer();
    if (!io) {
        return;
    }

    const eventName = event.status === 'completed' ? 'credify.phone.job.completed' : 'credify.phone.job.failed';
    io.of('/credify-phone-lookup').to(`credify:phone:job:${event.jobId}`).emit(eventName, event);
}

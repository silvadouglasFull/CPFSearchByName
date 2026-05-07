/**
 * Realtime Event Types and Emission Functions
 * Defines Socket.io event contracts for HubDo bulk lookup
 */

import { getSocketIOServer } from '@/realtime/socket-server';

export interface HuddoBulkItemUpdatedEvent {
    jobId: string;
    itemId: string;
    cpf: string;
    status: 'queued' | 'processing' | 'success' | 'error' | 'dead_letter';
    attemptCount: number;
    updatedAt: string;
    errorCode: string | null;
    errorMessage: string | null;
    creditosConsumidos: number;
    origin: string | null;
}

export interface HuddoBulkJobUpdatedEvent {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    summary: {
        total: number;
        queued: number;
        processing: number;
        success: number;
        error: number;
        deadLetter: number;
    };
    updatedAt: string;
}

export interface HuddoBulkJobTerminalEvent {
    jobId: string;
    status: 'completed' | 'failed';
    finalSummary: {
        total: number;
        success: number;
        error: number;
        deadLetter: number;
    };
    finishedAt: string;
}

export interface HuddoBulkFindMatchFoundEvent {
    jobId: string;
    foundCpf: string;
    foundName: string;
    foundBirthDate: string | null;
}

/**
 * Emit item status update to job room
 */
export function emitHubdoBulkItemUpdated(event: HuddoBulkItemUpdatedEvent): void {
    const io = getSocketIOServer();
    if (!io) {
        console.warn('[Socket.io] Server not initialized, skipping item event');
        return;
    }

    const room = `hubdo:job:${event.jobId}`;

    try {
        io.of('/hubdo-bulk').to(room).emit('hubdo.bulk.item.updated', event);
    } catch (error) {
        console.error(`[Socket.io] Failed to emit item.updated event:`, error);
    }
}

/**
 * Emit job aggregate status update to job room
 */
export function emitHubdoBulkJobUpdated(event: HuddoBulkJobUpdatedEvent): void {
    const io = getSocketIOServer();
    if (!io) {
        console.warn('[Socket.io] Server not initialized, skipping job update event');
        return;
    }

    const room = `hubdo:job:${event.jobId}`;

    try {
        io.of('/hubdo-bulk').to(room).emit('hubdo.bulk.job.updated', event);
    } catch (error) {
        console.error(`[Socket.io] Failed to emit job.updated event:`, error);
    }
}

/**
 * Emit job terminal event (completed or failed)
 */
export function emitHubdoBulkJobTerminal(event: HuddoBulkJobTerminalEvent): void {
    const io = getSocketIOServer();
    if (!io) {
        console.warn('[Socket.io] Server not initialized, skipping job terminal event');
        return;
    }

    const room = `hubdo:job:${event.jobId}`;
    const eventName = event.status === 'completed' ? 'hubdo.bulk.job.completed' : 'hubdo.bulk.job.failed';

    try {
        io.of('/hubdo-bulk').to(room).emit(eventName, event);
    } catch (error) {
        console.error(`[Socket.io] Failed to emit job terminal event:`, error);
    }
}

/**
 * Emit find-match found event when a matching person name is found
 */
export function emitHubdoBulkFindMatchFound(event: HuddoBulkFindMatchFoundEvent): void {
    const io = getSocketIOServer();
    if (!io) {
        console.warn('[Socket.io] Server not initialized, skipping find-match found event');
        return;
    }

    const room = `hubdo:job:${event.jobId}`;

    try {
        io.of('/hubdo-bulk').to(room).emit('hubdo.bulk.find.match.found', event);
    } catch (error) {
        console.error(`[Socket.io] Failed to emit find-match found event:`, error);
    }
}

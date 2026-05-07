/**
 * Socket.io Hook for HubDo Bulk Lookup Real-time Updates
 * Manages connection, room subscription, and event handling
 */

'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

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

export interface UseHuddoBulkSocketCallbacks {
    onItemUpdated?: (event: HuddoBulkItemUpdatedEvent) => void;
    onJobUpdated?: (event: HuddoBulkJobUpdatedEvent) => void;
    onJobCompleted?: (event: HuddoBulkJobTerminalEvent) => void;
    onJobFailed?: (event: HuddoBulkJobTerminalEvent) => void;
    onError?: (error: string) => void;
}

export function useHuddoBulkSocket(jobId: string | null, callbacks: UseHuddoBulkSocketCallbacks) {
    const socketRef = useRef<Socket | null>(null);
    const subscriptionRef = useRef<string | null>(null);

    useEffect(() => {
        if (!jobId) {
            return;
        }

        // Initialize socket connection
        if (!socketRef.current) {
            socketRef.current = io('/hubdo-bulk', {
                path: '/socket.io',
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            });

            socketRef.current.on('error', (error: string) => {
                console.error('[Socket.io] Connection error:', error);
                callbacks.onError?.(error);
            });

            socketRef.current.on('connect_error', (error: Error) => {
                console.error('[Socket.io] Connect error:', error.message);
                callbacks.onError?.(error.message);
            });
        }

        // Subscribe to job room
        if (socketRef.current && subscriptionRef.current !== jobId) {
            if (subscriptionRef.current) {
                socketRef.current.emit('hubdo.bulk.unsubscribe', { jobId: subscriptionRef.current });
            }

            socketRef.current.emit('hubdo.bulk.subscribe', { jobId });
            subscriptionRef.current = jobId;

            // Setup event listeners
            socketRef.current.on('hubdo.bulk.job.subscribed', () => {
                console.log(`[Socket.io] Subscribed to job ${jobId}`);
            });

            socketRef.current.on('hubdo.bulk.item.updated', (event: HuddoBulkItemUpdatedEvent) => {
                console.log('[Socket.io] Item updated:', event);
                callbacks.onItemUpdated?.(event);
            });

            socketRef.current.on('hubdo.bulk.job.updated', (event: HuddoBulkJobUpdatedEvent) => {
                console.log('[Socket.io] Job updated:', event);
                callbacks.onJobUpdated?.(event);
            });

            socketRef.current.on('hubdo.bulk.job.completed', (event: HuddoBulkJobTerminalEvent) => {
                console.log('[Socket.io] Job completed:', event);
                callbacks.onJobCompleted?.(event);
            });

            socketRef.current.on('hubdo.bulk.job.failed', (event: HuddoBulkJobTerminalEvent) => {
                console.log('[Socket.io] Job failed:', event);
                callbacks.onJobFailed?.(event);
            });
        }

        return () => {
            // Cleanup on unmount or jobId change
            if (socketRef.current && subscriptionRef.current) {
                socketRef.current.emit('hubdo.bulk.unsubscribe', { jobId: subscriptionRef.current });
            }
        };
    }, [jobId, callbacks]);

    // Disconnect on component unmount
    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);
}

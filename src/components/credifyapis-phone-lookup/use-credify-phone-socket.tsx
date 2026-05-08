'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { CredifyPhoneItemStatus, CredifyPhoneJobSummary } from './types';

export interface CredifyPhoneItemUpdatedEvent {
    jobId: string;
    itemId: string;
    normalizedPhone: string;
    status: CredifyPhoneItemStatus;
    attemptCount: number;
    updatedAt: string;
    providerCode: string | null;
    errorCode: string | null;
    errorMessage: string | null;
}

export interface CredifyPhoneJobUpdatedEvent {
    jobId: string;
    status: 'queued' | 'processing' | 'completed' | 'failed';
    summary: CredifyPhoneJobSummary;
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

interface UseCredifyPhoneSocketCallbacks {
    onItemUpdated?: (event: CredifyPhoneItemUpdatedEvent) => void;
    onJobUpdated?: (event: CredifyPhoneJobUpdatedEvent) => void;
    onJobCompleted?: (event: CredifyPhoneJobTerminalEvent) => void;
    onJobFailed?: (event: CredifyPhoneJobTerminalEvent) => void;
    onError?: (message: string) => void;
}

export function useCredifyPhoneSocket(jobId: string | null, callbacks: UseCredifyPhoneSocketCallbacks): void {
    const socketRef = useRef<Socket | null>(null);
    const currentJobRef = useRef<string | null>(null);

    useEffect(() => {
        if (!jobId) {
            return;
        }

        if (!socketRef.current) {
            socketRef.current = io('/credify-phone-lookup', {
                path: '/socket.io',
                transports: ['websocket'],
                reconnection: true,
            });

            socketRef.current.on('connect_error', (error: Error) => {
                callbacks.onError?.(error.message);
            });

            socketRef.current.on('error', (payload: { message?: string } | string) => {
                const message = typeof payload === 'string' ? payload : payload.message || 'Socket error';
                callbacks.onError?.(message);
            });
        }

        if (currentJobRef.current !== jobId) {
            if (currentJobRef.current) {
                socketRef.current.emit('credify.phone.unsubscribe', { jobId: currentJobRef.current });
            }

            socketRef.current.emit('credify.phone.subscribe', { jobId });
            currentJobRef.current = jobId;

            socketRef.current.on('credify.phone.item.updated', (event: CredifyPhoneItemUpdatedEvent) => {
                callbacks.onItemUpdated?.(event);
            });

            socketRef.current.on('credify.phone.job.updated', (event: CredifyPhoneJobUpdatedEvent) => {
                callbacks.onJobUpdated?.(event);
            });

            socketRef.current.on('credify.phone.job.completed', (event: CredifyPhoneJobTerminalEvent) => {
                callbacks.onJobCompleted?.(event);
            });

            socketRef.current.on('credify.phone.job.failed', (event: CredifyPhoneJobTerminalEvent) => {
                callbacks.onJobFailed?.(event);
            });
        }

        return () => {
            if (socketRef.current && currentJobRef.current) {
                socketRef.current.emit('credify.phone.unsubscribe', { jobId: currentJobRef.current });
            }
        };
    }, [jobId, callbacks]);

    useEffect(() => {
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);
}

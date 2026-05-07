/**
 * Socket.io Server Initialization and Management
 * Singleton for managing realtime connections and events
 */

import { Socket, Server as SocketIOServer } from 'socket.io';

let socketIOInstance: SocketIOServer | null = null;

export function getSocketIOServer(): SocketIOServer | null {
    return socketIOInstance;
}

export function setSocketIOServer(instance: SocketIOServer | null): void {
    socketIOInstance = instance;
}

/**
 * Initialize Socket.io server with HTTP server
 * Called once during application startup
 */
export function initializeSocketIOServer(httpServer: any): SocketIOServer {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    // Set up handlers on the /hubdo-bulk namespace
    const hubdoBulkNamespace = io.of('/hubdo-bulk');

    hubdoBulkNamespace.on('connection', (socket: Socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);

        socket.on('hubdo.bulk.subscribe', (data: { jobId: string }) => {
            const { jobId } = data;

            if (!jobId || typeof jobId !== 'string') {
                socket.emit('error', { message: 'Invalid jobId' });
                return;
            }

            const room = `hubdo:job:${jobId}`;
            socket.join(room);

            socket.emit('hubdo.bulk.job.subscribed', {
                jobId,
                connectedAt: new Date().toISOString(),
            });

            console.log(`[Socket.io] Socket ${socket.id} subscribed to room ${room}`);
        });

        socket.on('hubdo.bulk.unsubscribe', (data: { jobId: string }) => {
            const { jobId } = data;

            if (!jobId || typeof jobId !== 'string') {
                return;
            }

            const room = `hubdo:job:${jobId}`;
            socket.leave(room);

            console.log(`[Socket.io] Socket ${socket.id} unsubscribed from room ${room}`);
        });

        socket.on('disconnect', () => {
            console.log(`[Socket.io] Client disconnected: ${socket.id}`);
        });
    });

    setSocketIOServer(io);
    return io;
}

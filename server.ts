/**
 * Socket.io Server Custom Entry Point
 * Run this with: npm run start:with-socket or configure in your deployment
 */

import { startCredifyPhoneBulkWorker } from '@/credifyApis/application/credify-phone-bulk-worker.service';
import { startHubdoBulkLookupWorker } from '@/hubdoCpf/application/hubdo-bulk-lookup-worker.service';
import { initializeSocketIOServer } from '@/realtime/socket-server';
import { createServer } from 'http';
import next from 'next';
import { parse } from 'url';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const shouldStartBulkWorker = process.env.START_HUBDO_BULK_WORKER === 'true';
const shouldStartCredifyWorker = process.env.START_CREDIFY_PHONE_WORKER === 'true';

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    const httpServer = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true);
            await handle(req, res, parsedUrl);
        } catch (err) {
            console.error('Error handling request:', err);
            res.statusCode = 500;
            res.end('Internal server error');
        }
    });

    // Initialize Socket.io server
    initializeSocketIOServer(httpServer);

    if (shouldStartBulkWorker) {
        await startHubdoBulkLookupWorker();
        console.log('> HubDo bulk lookup worker initialized in server process');
    }

    if (shouldStartCredifyWorker) {
        try {
            await startCredifyPhoneBulkWorker();
            console.log('> Credify phone lookup worker initialized in server process');
        } catch (err) {
            console.warn('> Credify phone lookup worker could not start (check credentials):', (err as Error).message);
        }
    }

    httpServer
        .once('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Server ready on http://${hostname}:${port}`);
            console.log('> Socket.io realtime server initialized at /hubdo-bulk');
            console.log('> Socket.io realtime server initialized at /credify-phone-lookup');
        });
});

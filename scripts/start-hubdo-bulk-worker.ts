import { startHubdoBulkLookupWorker } from '../src/hubdoCpf/application/hubdo-bulk-lookup-worker.service';

async function main(): Promise<void> {
    await startHubdoBulkLookupWorker();
    console.log('HubDo bulk lookup worker is running.');
}

void main().catch((error) => {
    console.error('Failed to start HubDo bulk lookup worker:', error);
    process.exit(1);
});

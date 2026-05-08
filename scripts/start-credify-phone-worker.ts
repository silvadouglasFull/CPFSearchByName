import { startCredifyPhoneBulkWorker } from '../src/credifyApis/application/credify-phone-bulk-worker.service';

async function main(): Promise<void> {
    await startCredifyPhoneBulkWorker();
    console.log('Credify phone lookup worker is running.');
}

void main().catch((error) => {
    console.error('Failed to start Credify phone lookup worker:', error);
    process.exit(1);
});

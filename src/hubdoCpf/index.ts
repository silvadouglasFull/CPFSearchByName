/**
 * HubDo CPF Module Index
 * Exports and factory functions
 */

import { HubdoBulkLookupService } from '@/hubdoCpf/application/hubdo-bulk-lookup.service';
import { HubdoCpfLookupService } from '@/hubdoCpf/application/hubdo-cpf-lookup.service';
import { DrizzleHubdoBulkLookupRepository } from '@/hubdoCpf/infrastructure/drizzle-hubdo-bulk-lookup.repository';
import { DrizzleHubdoCpfLookupRepository } from '@/hubdoCpf/infrastructure/drizzle-hubdo-cpf-lookup.repository';
import { HubdoHttpClient } from '@/hubdoCpf/infrastructure/http-hubdo-client';

export { HubdoBulkLookupService } from '@/hubdoCpf/application/hubdo-bulk-lookup.service';
export { HubdoCpfLookupService } from '@/hubdoCpf/application/hubdo-cpf-lookup.service';
export * from '@/hubdoCpf/domain/bulk-lookup-types';
export * from '@/hubdoCpf/domain/types';
export { DrizzleHubdoBulkLookupRepository } from '@/hubdoCpf/infrastructure/drizzle-hubdo-bulk-lookup.repository';
export { DrizzleHubdoCpfLookupRepository } from '@/hubdoCpf/infrastructure/drizzle-hubdo-cpf-lookup.repository';
export { HubdoHttpClient } from '@/hubdoCpf/infrastructure/http-hubdo-client';

export function createHubdoCpfLookupService(): HubdoCpfLookupService {
    const httpClient = new HubdoHttpClient();
    const repository = new DrizzleHubdoCpfLookupRepository();
    return new HubdoCpfLookupService(httpClient, repository);
}

export function createHubdoBulkLookupRepository(): DrizzleHubdoBulkLookupRepository {
    return new DrizzleHubdoBulkLookupRepository();
}

export function createHubdoBulkLookupService(): HubdoBulkLookupService {
    return new HubdoBulkLookupService(createHubdoBulkLookupRepository());
}

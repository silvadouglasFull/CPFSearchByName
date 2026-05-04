/**
 * HubDo CPF Module Index
 * Exports and factory functions
 */

import { HubdoCpfLookupService } from '@/hubdoCpf/application/hubdo-cpf-lookup.service';
import { DrizzleHubdoCpfLookupRepository } from '@/hubdoCpf/infrastructure/drizzle-hubdo-cpf-lookup.repository';
import { HubdoHttpClient } from '@/hubdoCpf/infrastructure/http-hubdo-client';

export { HubdoCpfLookupService } from '@/hubdoCpf/application/hubdo-cpf-lookup.service';
export * from '@/hubdoCpf/domain/types';
export { DrizzleHubdoCpfLookupRepository } from '@/hubdoCpf/infrastructure/drizzle-hubdo-cpf-lookup.repository';
export { HubdoHttpClient } from '@/hubdoCpf/infrastructure/http-hubdo-client';

export function createHubdoCpfLookupService(): HubdoCpfLookupService {
    const httpClient = new HubdoHttpClient();
    const repository = new DrizzleHubdoCpfLookupRepository();
    return new HubdoCpfLookupService(httpClient, repository);
}

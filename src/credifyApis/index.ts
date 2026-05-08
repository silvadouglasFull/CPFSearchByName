import { CredifyAuthService } from '@/credifyApis/application/credify-auth.service';
import { CredifyPhoneBulkEnqueueService } from '@/credifyApis/application/credify-phone-bulk-enqueue.service';
import { CredifyPhoneLookupService } from '@/credifyApis/application/credify-phone-lookup.service';
import { DrizzleCredifyPhoneJobRepository } from '@/credifyApis/infrastructure/drizzle-credify-phone-job.repository';
import { DrizzleCredifyPhoneLookupRepository } from '@/credifyApis/infrastructure/drizzle-credify-phone-lookup.repository';
import { CredifyHttpClient } from '@/credifyApis/infrastructure/http-credify-client';

export { CredifyAuthService } from '@/credifyApis/application/credify-auth.service';
export { CredifyPhoneBulkEnqueueService } from '@/credifyApis/application/credify-phone-bulk-enqueue.service';
export { CredifyPhoneLookupService } from '@/credifyApis/application/credify-phone-lookup.service';
export * from '@/credifyApis/domain/types';
export { DrizzleCredifyPhoneJobRepository } from '@/credifyApis/infrastructure/drizzle-credify-phone-job.repository';
export { DrizzleCredifyPhoneLookupRepository } from '@/credifyApis/infrastructure/drizzle-credify-phone-lookup.repository';
export { CredifyHttpClient } from '@/credifyApis/infrastructure/http-credify-client';

export function createCredifyPhoneLookupRepository(): DrizzleCredifyPhoneLookupRepository {
    return new DrizzleCredifyPhoneLookupRepository();
}

export function createCredifyPhoneJobRepository(): DrizzleCredifyPhoneJobRepository {
    return new DrizzleCredifyPhoneJobRepository();
}

export function createCredifyAuthService(): CredifyAuthService {
    return new CredifyAuthService();
}

export function createCredifyHttpClient(): CredifyHttpClient {
    return new CredifyHttpClient(createCredifyAuthService());
}

export function createCredifyPhoneLookupService(): CredifyPhoneLookupService {
    return new CredifyPhoneLookupService(createCredifyHttpClient(), createCredifyPhoneLookupRepository());
}

export function createCredifyPhoneBulkEnqueueService(): CredifyPhoneBulkEnqueueService {
    return new CredifyPhoneBulkEnqueueService(createCredifyPhoneJobRepository());
}

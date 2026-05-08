import { AppSettings, AppSettingsFields, AppSettingsRepository, DEFAULT_APP_SETTINGS } from '@/appSettings/domain/types';

export class AppSettingsService {
    constructor(private readonly repository: AppSettingsRepository) { }

    async getSettings(authenticatedUserId?: string): Promise<AppSettings> {
        const userId = this.requireAuthenticatedUserId(authenticatedUserId);
        const existing = await this.repository.getGlobal(userId);

        if (existing) {
            return existing;
        }

        return this.repository.upsertGlobal(userId, DEFAULT_APP_SETTINGS);
    }

    async updateSettings(authenticatedUserId: string | undefined, updates: Partial<AppSettingsFields>): Promise<AppSettings> {
        const userId = this.requireAuthenticatedUserId(authenticatedUserId);
        return this.repository.upsertGlobal(userId, updates);
    }

    async initializeDefaultSettingsForUser(authenticatedUserId: string): Promise<void> {
        const userId = this.requireAuthenticatedUserId(authenticatedUserId);
        const existing = await this.repository.getGlobal(userId);

        if (existing) {
            return;
        }

        await this.repository.upsertGlobal(userId, DEFAULT_APP_SETTINGS);
    }

    private requireAuthenticatedUserId(authenticatedUserId?: string): string {
        const normalized = authenticatedUserId?.trim();

        if (!normalized) {
            throw new Error('Authenticated user id is required for app settings operations.');
        }

        return normalized;
    }
}

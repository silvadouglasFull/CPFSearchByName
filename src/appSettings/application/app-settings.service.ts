import { AppSettings, AppSettingsFields, AppSettingsRepository, DEFAULT_APP_SETTINGS } from '@/appSettings/domain/types';

export class AppSettingsService {
    constructor(private readonly repository: AppSettingsRepository) { }

    async getSettings(): Promise<AppSettings> {
        const existing = await this.repository.getGlobal();

        if (existing) {
            return existing;
        }

        return this.repository.upsertGlobal(DEFAULT_APP_SETTINGS);
    }

    async updateSettings(updates: Partial<AppSettingsFields>): Promise<AppSettings> {
        return this.repository.upsertGlobal(updates);
    }
}

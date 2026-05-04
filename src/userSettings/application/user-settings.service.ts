import { DEFAULT_USER_SETTINGS, UserSettings, UserSettingsFields, UserSettingsRepository } from '@/userSettings/domain/types';

export class UserSettingsService {
    constructor(private readonly repository: UserSettingsRepository) { }

    async getSettings(userId: string): Promise<UserSettings> {
        const existing = await this.repository.findByUserId(userId);

        if (existing) {
            return existing;
        }

        return this.repository.upsert(userId, DEFAULT_USER_SETTINGS);
    }

    async updateSettings(userId: string, updates: Partial<UserSettingsFields>): Promise<UserSettings> {
        return this.repository.upsert(userId, updates);
    }
}

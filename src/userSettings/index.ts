import { UserSettingsService } from '@/userSettings/application/user-settings.service';
import { DrizzleUserSettingsRepository } from '@/userSettings/infrastructure/drizzle-user-settings.repository';

export { MissingUserIdError } from '@/userSettings/domain/errors';
export { DEFAULT_USER_SETTINGS } from '@/userSettings/domain/types';
export type { UserSettings, UserSettingsFields, UserSettingsRepository } from '@/userSettings/domain/types';
export { DrizzleUserSettingsRepository, UserSettingsService };

export function createUserSettingsService(): UserSettingsService {
    return new UserSettingsService(new DrizzleUserSettingsRepository());
}

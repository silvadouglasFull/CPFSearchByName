import { AppSettingsService } from '@/appSettings/application/app-settings.service';
import { DrizzleAppSettingsRepository } from '@/appSettings/infrastructure/drizzle-app-settings.repository';

export { DEFAULT_APP_SETTINGS, GLOBAL_SETTINGS_KEY } from '@/appSettings/domain/types';
export type { AppSettings, AppSettingsFields, AppSettingsRepository } from '@/appSettings/domain/types';
export { AppSettingsService, DrizzleAppSettingsRepository };

export function createAppSettingsService(): AppSettingsService {
    return new AppSettingsService(new DrizzleAppSettingsRepository());
}

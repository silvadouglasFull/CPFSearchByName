import 'dotenv/config';
import { createAppSettingsService, DEFAULT_APP_SETTINGS } from '../src/appSettings';

async function main(): Promise<void> {
    const service = createAppSettingsService();
    const settings = await service.updateSettings(DEFAULT_APP_SETTINGS);

    console.log('Seed applied for app_settings.');
    console.log(`singletonKey=${settings.singletonKey}`);
    console.log(`updatedAt=${settings.updatedAt.toISOString()}`);
}

main().catch((error) => {
    console.error('Failed to seed app_settings:', error);
    process.exit(1);
});

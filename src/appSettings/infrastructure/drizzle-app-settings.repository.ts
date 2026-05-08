import { AppSettings, AppSettingsFields, AppSettingsRepository, DEFAULT_APP_SETTINGS, GLOBAL_SETTINGS_KEY } from '@/appSettings/domain/types';
import { db } from '@/database/db';
import { appSettings } from '@/database/schema';
import { and, eq } from 'drizzle-orm';

export class DrizzleAppSettingsRepository implements AppSettingsRepository {
    async getGlobal(authenticatedUserId: string): Promise<AppSettings | null> {
        const result = await db
            .select()
            .from(appSettings)
            .where(
                and(
                    eq(appSettings.authenticatedUserId, authenticatedUserId),
                    eq(appSettings.singletonKey, GLOBAL_SETTINGS_KEY),
                ),
            )
            .limit(1);

        return result[0] ?? null;
    }

    async upsertGlobal(authenticatedUserId: string, settings: Partial<AppSettingsFields>): Promise<AppSettings> {
        const insertValues = {
            ...DEFAULT_APP_SETTINGS,
            ...settings,
            authenticatedUserId,
            singletonKey: GLOBAL_SETTINGS_KEY,
        };

        const result = await db
            .insert(appSettings)
            .values(insertValues)
            .onConflictDoUpdate({
                target: [appSettings.authenticatedUserId, appSettings.singletonKey],
                set: {
                    ...settings,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return result[0]!;
    }
}

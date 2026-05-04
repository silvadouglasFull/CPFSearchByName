import { db } from '@/database/db';
import { userSettings } from '@/database/schema';
import { DEFAULT_USER_SETTINGS, UserSettings, UserSettingsFields, UserSettingsRepository } from '@/userSettings/domain/types';
import { eq } from 'drizzle-orm';

export class DrizzleUserSettingsRepository implements UserSettingsRepository {
    async findByUserId(userId: string): Promise<UserSettings | null> {
        const result = await db
            .select()
            .from(userSettings)
            .where(eq(userSettings.userId, userId))
            .limit(1);

        return result[0] ?? null;
    }

    async upsert(userId: string, settings: Partial<UserSettingsFields>): Promise<UserSettings> {
        const insertValues = { ...DEFAULT_USER_SETTINGS, ...settings, userId };

        const result = await db
            .insert(userSettings)
            .values(insertValues)
            .onConflictDoUpdate({
                target: userSettings.userId,
                set: {
                    ...settings,
                    updatedAt: new Date(),
                },
            })
            .returning();

        return result[0]!;
    }
}

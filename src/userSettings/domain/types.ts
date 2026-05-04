export interface UserSettings {
    id: string;
    userId: string;
    totalPages: number;
    resultsPerPage: number;
    throttleDelayMs: number;
    pageResponseTimeoutMs: number;
    pageNavigationTimeoutMs: number;
    pageSelectorTimeoutMs: number;
    createdAt: Date;
    updatedAt: Date;
}

export type UserSettingsFields = Omit<UserSettings, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

export const DEFAULT_USER_SETTINGS: UserSettingsFields = {
    totalPages: 6,
    resultsPerPage: 10,
    throttleDelayMs: 1000,
    pageResponseTimeoutMs: 30000,
    pageNavigationTimeoutMs: 60000,
    pageSelectorTimeoutMs: 15000,
};

export interface UserSettingsRepository {
    findByUserId(userId: string): Promise<UserSettings | null>;
    upsert(userId: string, settings: Partial<UserSettingsFields>): Promise<UserSettings>;
}

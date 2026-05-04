import {
    CLI_FIRST_USER_ARG_INDEX,
    DEFAULT_PAGE_SELECTOR,
    DETAILS_PAGE_URL,
    FILE_ENCODING_UTF8,
    FIRST_PAGE_NUMBER,
    JSON_OUTPUT_INDENT_SPACES,
    PAGE_NAVIGATION_TIMEOUT_MS,
    PAGE_RESPONSE_TIMEOUT_MS,
    PAGE_SELECTOR_TIMEOUT_MS,
    PAGE_THROTTLE_DELAY_MS,
    RESULTS_PER_PAGE,
    SEARCH_API_HOSTNAME,
    SEARCH_API_PATHNAME,
    SEARCH_PAGE_URL,
    TOTAL_PAGES,
} from '@/getCpfsByName/domain/constants';

export interface AppSettings {
    id: string;
    singletonKey: string;
    resultsPerPage: number;
    totalPages: number;
    pageResponseTimeoutMs: number;
    pageNavigationTimeoutMs: number;
    pageSelectorTimeoutMs: number;
    pageThrottleDelayMs: number;
    jsonOutputIndentSpaces: number;
    fileEncodingUtf8: string;
    cliFirstUserArgIndex: number;
    firstPageNumber: number;
    searchPageUrl: string;
    detailsPageUrl: string;
    searchApiHostname: string;
    searchApiPathname: string;
    defaultPageSelector: string;
    createdAt: Date;
    updatedAt: Date;
}

export type AppSettingsFields = Omit<AppSettings, 'id' | 'singletonKey' | 'createdAt' | 'updatedAt'>;

export const GLOBAL_SETTINGS_KEY = 'global';

export const DEFAULT_APP_SETTINGS: AppSettingsFields = {
    resultsPerPage: RESULTS_PER_PAGE,
    totalPages: TOTAL_PAGES,
    pageResponseTimeoutMs: PAGE_RESPONSE_TIMEOUT_MS,
    pageNavigationTimeoutMs: PAGE_NAVIGATION_TIMEOUT_MS,
    pageSelectorTimeoutMs: PAGE_SELECTOR_TIMEOUT_MS,
    pageThrottleDelayMs: PAGE_THROTTLE_DELAY_MS,
    jsonOutputIndentSpaces: JSON_OUTPUT_INDENT_SPACES,
    fileEncodingUtf8: FILE_ENCODING_UTF8,
    cliFirstUserArgIndex: CLI_FIRST_USER_ARG_INDEX,
    firstPageNumber: FIRST_PAGE_NUMBER,
    searchPageUrl: SEARCH_PAGE_URL,
    detailsPageUrl: DETAILS_PAGE_URL,
    searchApiHostname: SEARCH_API_HOSTNAME,
    searchApiPathname: SEARCH_API_PATHNAME,
    defaultPageSelector: DEFAULT_PAGE_SELECTOR,
};

export interface AppSettingsRepository {
    getGlobal(): Promise<AppSettings | null>;
    upsertGlobal(settings: Partial<AppSettingsFields>): Promise<AppSettings>;
}

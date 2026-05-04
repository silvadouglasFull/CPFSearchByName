import { AppSettings, AppSettingsFields, DEFAULT_APP_SETTINGS } from '@/appSettings/domain/types';
import { createAppSettingsService } from '@/appSettings/index';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function toAppSettingsFields(settings: AppSettings): AppSettingsFields {
    return {
        resultsPerPage: settings.resultsPerPage,
        totalPages: settings.totalPages,
        pageResponseTimeoutMs: settings.pageResponseTimeoutMs,
        pageNavigationTimeoutMs: settings.pageNavigationTimeoutMs,
        pageSelectorTimeoutMs: settings.pageSelectorTimeoutMs,
        pageThrottleDelayMs: settings.pageThrottleDelayMs,
        jsonOutputIndentSpaces: settings.jsonOutputIndentSpaces,
        fileEncodingUtf8: settings.fileEncodingUtf8,
        cliFirstUserArgIndex: settings.cliFirstUserArgIndex,
        firstPageNumber: settings.firstPageNumber,
        searchPageUrl: settings.searchPageUrl,
        detailsPageUrl: settings.detailsPageUrl,
        searchApiHostname: settings.searchApiHostname,
        searchApiPathname: settings.searchApiPathname,
        defaultPageSelector: settings.defaultPageSelector,
    };
}

function toPartialAppSettingsFields(payload: unknown): Partial<AppSettingsFields> {
    const input = (payload ?? {}) as Record<string, unknown>;
    const updates: Partial<Record<keyof AppSettingsFields, string | number>> = {};

    for (const key of Object.keys(DEFAULT_APP_SETTINGS) as Array<keyof AppSettingsFields>) {
        const value = input[key];

        if (value === undefined) {
            continue;
        }

        if (typeof DEFAULT_APP_SETTINGS[key] === 'number') {
            const parsed = Number(value);

            if (!Number.isFinite(parsed)) {
                continue;
            }

            updates[key] = parsed;
            continue;
        }

        updates[key] = String(value).trim();
    }

    return updates as Partial<AppSettingsFields>;
}

export async function GET(): Promise<NextResponse> {
    try {
        const settings = await createAppSettingsService().getSettings();
        return NextResponse.json({ settings: toAppSettingsFields(settings) }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request): Promise<NextResponse> {
    try {
        const updates = toPartialAppSettingsFields(await request.json());
        const settings = await createAppSettingsService().updateSettings(updates);
        return NextResponse.json({ settings: toAppSettingsFields(settings) }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { AppSettingsFields } from '@/appSettings/domain/types';
import { createAppSettingsService } from '@/appSettings/index';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getAuthenticatedUserId(request: Request): string | null {
    const header = request.headers.get('x-authenticated-user-id');
    const normalized = header?.trim();
    return normalized || null;
}

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const authenticatedUserId = getAuthenticatedUserId(request);

        if (!authenticatedUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const settings = await createAppSettingsService().getSettings(authenticatedUserId);
        return NextResponse.json({ settings }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request): Promise<NextResponse> {
    try {
        const authenticatedUserId = getAuthenticatedUserId(request);

        if (!authenticatedUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = (await request.json()) as Partial<AppSettingsFields>;
        const settings = await createAppSettingsService().updateSettings(authenticatedUserId, body);
        return NextResponse.json({ settings }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

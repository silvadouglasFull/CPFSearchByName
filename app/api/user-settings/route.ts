import { MissingUserIdError } from '@/userSettings/domain/errors';
import { UserSettingsFields } from '@/userSettings/domain/types';
import { createUserSettingsService } from '@/userSettings/index';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getUserId(searchParams: URLSearchParams): string {
    const userId = String(searchParams.get('userId') ?? '').trim();

    if (!userId) {
        throw new MissingUserIdError();
    }

    return userId;
}

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const userId = getUserId(searchParams);
        const service = createUserSettingsService();
        const settings = await service.getSettings(userId);
        return NextResponse.json({ settings }, { status: 200 });
    } catch (error) {
        if (error instanceof MissingUserIdError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const userId = getUserId(searchParams);
        const body = (await request.json()) as Partial<UserSettingsFields>;
        const service = createUserSettingsService();
        const settings = await service.updateSettings(userId, body);
        return NextResponse.json({ settings }, { status: 200 });
    } catch (error) {
        if (error instanceof MissingUserIdError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

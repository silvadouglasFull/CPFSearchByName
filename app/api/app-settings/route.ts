import { AppSettingsFields } from '@/appSettings/domain/types';
import { createAppSettingsService } from '@/appSettings/index';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
    try {
        const settings = await createAppSettingsService().getSettings();
        return NextResponse.json({ settings }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request): Promise<NextResponse> {
    try {
        const updates = (await request.json()) as Partial<AppSettingsFields>;
        const settings = await createAppSettingsService().updateSettings(updates);
        return NextResponse.json({ settings }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

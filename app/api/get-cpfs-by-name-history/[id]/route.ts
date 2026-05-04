import { PortalRecord } from '@/getCpfsByName/domain/types';
import { createGetCpfsByNameHistoryService } from '@/getCpfsByNameHistory';
import { NextResponse } from 'next/server';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: RouteContext): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const service = createGetCpfsByNameHistoryService();
        const item = await service.getById(id);

        if (!item) {
            return NextResponse.json({ error: 'Search history record not found.' }, { status: 404 });
        }

        return NextResponse.json({ item }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PUT(request: Request, context: RouteContext): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const body = (await request.json()) as {
            searchName?: string;
            records?: unknown[];
        };

        const updates: {
            searchName?: string;
            records?: PortalRecord[];
        } = {};

        if (body.searchName !== undefined) {
            updates.searchName = body.searchName.trim();
        }

        if (body.records !== undefined) {
            updates.records = (Array.isArray(body.records) ? body.records : []) as PortalRecord[];
        }

        const service = createGetCpfsByNameHistoryService();
        const item = await service.update(id, updates);

        if (!item) {
            return NextResponse.json({ error: 'Search history record not found.' }, { status: 404 });
        }

        return NextResponse.json({ item }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(_: Request, context: RouteContext): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const service = createGetCpfsByNameHistoryService();
        const deleted = await service.delete(id);

        if (!deleted) {
            return NextResponse.json({ error: 'Search history record not found.' }, { status: 404 });
        }

        return NextResponse.json({ deleted: true }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

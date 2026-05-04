import { normalizeCpf } from '@/filterByCpf/domain/cpf-utils';
import { PortalResultRecord } from '@/filterByCpf/domain/types';
import { createFilterCpfHistoryService } from '@/filterCpfHistory';
import { NextResponse } from 'next/server';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: RouteContext): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const service = createFilterCpfHistoryService();
        const item = await service.getById(id);

        if (!item) {
            return NextResponse.json({ error: 'History record not found.' }, { status: 404 });
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
        const body = (await request.json()) as { partialCpf?: string; records?: unknown[] };
        const updates: { searchTerm?: string; resultRecords?: PortalResultRecord[] } = {};

        if (body.partialCpf !== undefined) {
            updates.searchTerm = normalizeCpf(body.partialCpf);
        }

        if (body.records !== undefined) {
            updates.resultRecords = (Array.isArray(body.records) ? body.records : []) as PortalResultRecord[];
        }

        const service = createFilterCpfHistoryService();
        const item = await service.update(id, updates);

        if (!item) {
            return NextResponse.json({ error: 'History record not found.' }, { status: 404 });
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
        const service = createFilterCpfHistoryService();
        const deleted = await service.delete(id);

        if (!deleted) {
            return NextResponse.json({ error: 'History record not found.' }, { status: 404 });
        }

        return NextResponse.json({ deleted: true }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { normalizePartialCpf, normalizeRegionDigit } from '@/generatorCpf/domain/cpf-format.utils';
import { GeneratedCpfRecord } from '@/generatorCpf/domain/types';
import { createGeneratorCpfHistoryService } from '@/generatorCpfHistory';
import { NextResponse } from 'next/server';

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(_: Request, context: RouteContext): Promise<NextResponse> {
    try {
        const { id } = await context.params;
        const service = createGeneratorCpfHistoryService();
        const item = await service.getByIdWithLookup(id);

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
        const body = (await request.json()) as {
            partialCpf?: string;
            stateRegionDigit?: string | null;
            records?: unknown[];
        };

        const updates: {
            partialCpf?: string;
            stateRegionDigit?: string | null;
            resultRecords?: GeneratedCpfRecord[];
        } = {};

        if (body.partialCpf !== undefined) {
            updates.partialCpf = normalizePartialCpf(body.partialCpf);
        }

        if (body.stateRegionDigit !== undefined) {
            updates.stateRegionDigit = normalizeRegionDigit(body.stateRegionDigit);
        }

        if (body.records !== undefined) {
            updates.resultRecords = (Array.isArray(body.records) ? body.records : []) as GeneratedCpfRecord[];
        }

        const service = createGeneratorCpfHistoryService();
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
        const service = createGeneratorCpfHistoryService();
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

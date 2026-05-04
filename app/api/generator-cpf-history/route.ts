import { normalizePartialCpf, normalizeRegionDigit } from '@/generatorCpf/domain/cpf-format.utils';
import { GeneratedCpfRecord } from '@/generatorCpf/domain/types';
import { createGeneratorCpfHistoryService } from '@/generatorCpfHistory';
import { NextResponse } from 'next/server';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function toPositiveInt(value: string | null, fallback: number): number {
    const parsed = Number(value ?? '');

    if (!Number.isFinite(parsed) || parsed < 1) {
        return fallback;
    }

    return Math.floor(parsed);
}

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const page = toPositiveInt(searchParams.get('page'), DEFAULT_PAGE);
        const pageSize = toPositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE);
        const service = createGeneratorCpfHistoryService();
        const result = await service.list({ page, pageSize });
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const body = (await request.json()) as {
            partialCpf?: string;
            stateRegionDigit?: string | null;
            records?: unknown[];
        };

        const partialCpf = normalizePartialCpf(body.partialCpf ?? '');
        const stateRegionDigit = normalizeRegionDigit(body.stateRegionDigit);
        const records = (Array.isArray(body.records) ? body.records : []) as GeneratedCpfRecord[];

        if (!partialCpf) {
            return NextResponse.json({ error: 'partialCpf is required.' }, { status: 400 });
        }

        const service = createGeneratorCpfHistoryService();
        const created = await service.create({
            partialCpf,
            stateRegionDigit,
            resultRecords: records,
        });

        return NextResponse.json({ item: created }, { status: 201 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

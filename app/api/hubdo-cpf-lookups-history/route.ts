import { createHubdoCpfLookupService } from '@/hubdoCpf';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

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
        const requestedPageSize = toPositiveInt(searchParams.get('pageSize'), DEFAULT_PAGE_SIZE);
        const pageSize = Math.min(MAX_PAGE_SIZE, requestedPageSize);
        const cpf = (searchParams.get('cpf') || '').trim();

        const service = createHubdoCpfLookupService();
        const result = await service.listHistory({
            page,
            pageSize,
            cpf: cpf || undefined,
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: `Failed to fetch history: ${message}` }, { status: 500 });
    }
}
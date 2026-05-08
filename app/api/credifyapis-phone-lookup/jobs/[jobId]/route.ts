import { createCredifyPhoneJobRepository } from '@/credifyApis';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RouteContext {
    params: Promise<{ jobId: string }>;
}

export async function GET(request: Request, context: RouteContext): Promise<NextResponse> {
    try {
        const { jobId } = await context.params;
        const url = new URL(request.url);
        const page = Number(url.searchParams.get('page') ?? 1);
        const pageSize = Number(url.searchParams.get('pageSize') ?? 50);
        const status = (url.searchParams.get('status') ?? undefined) as
            | 'queued'
            | 'processing'
            | 'success'
            | 'not_found'
            | 'error'
            | 'dead_letter'
            | undefined;

        const repository = createCredifyPhoneJobRepository();
        const data = await repository.getStatus({
            jobId,
            page,
            pageSize,
            status,
        });

        if (!data) {
            return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
        }

        return NextResponse.json(
            {
                job: data.job,
                summary: data.summary,
                items: data.items,
                page: data.page,
                pageSize: data.pageSize,
                totalItems: data.totalItems,
                totalPages: data.totalPages,
            },
            { status: 200 },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

import { createHubdoBulkLookupService } from '@/hubdoCpf';
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
        const status = url.searchParams.get('status') ?? undefined;

        const service = createHubdoBulkLookupService();
        const data = await service.getJobStatus({
            jobId,
            page,
            pageSize,
            status: status as 'queued' | 'processing' | 'success' | 'error' | 'dead_letter' | undefined,
        });

        if (!data) {
            return NextResponse.json({ error: 'Bulk lookup job not found.' }, { status: 404 });
        }

        return NextResponse.json(
            {
                job: {
                    id: data.job.id,
                    mode: data.job.mode,
                    status: data.job.status,
                    createdAt: data.job.createdAt,
                    updatedAt: data.job.updatedAt,
                    finishedAt: data.job.finishedAt,
                },
                summary: {
                    total: data.summary.total,
                    queued: data.summary.queued,
                    processing: data.summary.processing,
                    success: data.summary.success,
                    error: data.summary.error + data.summary.deadLetter,
                },
                items: data.items,
                page: data.page,
                pageSize: data.pageSize,
                totalItems: data.totalItems,
                totalPages: data.totalPages,
            },
            { status: 200 },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

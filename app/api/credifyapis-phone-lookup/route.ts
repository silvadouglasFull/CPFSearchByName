import { createCredifyPhoneBulkEnqueueService } from '@/credifyApis';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SingleBody = {
    phone?: string;
};

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const payload = (await request.json()) as SingleBody;
        const phone = payload.phone?.trim() ?? '';

        if (!phone) {
            return NextResponse.json({ error: 'Phone is required.' }, { status: 400 });
        }

        const service = createCredifyPhoneBulkEnqueueService();
        const created = await service.enqueueSinglePhone(phone);

        return NextResponse.json(
            {
                jobId: created.job.id,
                status: created.job.status,
                summary: {
                    total: created.summary.total,
                    queued: created.summary.queued,
                    processing: created.summary.processing,
                    success: created.summary.success,
                    notFound: created.summary.notFound,
                    error: created.summary.error,
                    deadLetter: created.summary.deadLetter,
                },
            },
            { status: 202 },
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

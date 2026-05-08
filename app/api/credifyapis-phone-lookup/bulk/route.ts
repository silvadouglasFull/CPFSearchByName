import { createCredifyPhoneBulkEnqueueService } from '@/credifyApis';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_PHONES_PER_REQUEST = 200;

type BulkBody = {
    phones?: string[];
};

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const payload = (await request.json()) as BulkBody;
        const phones = Array.isArray(payload.phones) ? payload.phones.map((phone) => phone.trim()).filter(Boolean) : [];

        if (phones.length === 0) {
            return NextResponse.json({ error: 'At least one phone number is required.' }, { status: 400 });
        }

        if (phones.length > MAX_PHONES_PER_REQUEST) {
            return NextResponse.json({ error: `Maximum ${MAX_PHONES_PER_REQUEST} phones per request.` }, { status: 400 });
        }

        const service = createCredifyPhoneBulkEnqueueService();
        const created = await service.enqueueBulkPhones(phones);

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

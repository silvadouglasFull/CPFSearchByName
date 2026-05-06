import { createHubdoBulkLookupService } from '@/hubdoCpf';
import {
    assertCpfProtectionRuntimeConfiguration,
    isCpfProtectionConfigurationError,
    normalizeCpf,
} from '@/security/cpf-protection';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CPFS_PER_REQUEST = 100;

type BulkLookupBody = {
    cpfs?: string[];
    mode?: 'normal' | 'turbo';
};

export async function POST(request: Request): Promise<NextResponse> {
    try {
        assertCpfProtectionRuntimeConfiguration();

        const payload = (await request.json()) as BulkLookupBody;
        const mode = payload.mode ?? 'normal';

        if (mode !== 'normal' && mode !== 'turbo') {
            return NextResponse.json(
                { error: 'Mode must be "normal" or "turbo".' },
                { status: 400 },
            );
        }

        const rawCpfs = Array.isArray(payload.cpfs) ? payload.cpfs : [];

        if (rawCpfs.length === 0) {
            return NextResponse.json(
                { error: 'At least one CPF is required.' },
                { status: 400 },
            );
        }

        const normalizedCpfs = [...new Set(rawCpfs.map((cpf) => normalizeCpf(cpf)).filter(Boolean))];

        if (normalizedCpfs.length === 0) {
            return NextResponse.json(
                { error: 'No valid CPF values were provided.' },
                { status: 400 },
            );
        }

        if (normalizedCpfs.length > MAX_CPFS_PER_REQUEST) {
            return NextResponse.json(
                { error: `Maximum ${MAX_CPFS_PER_REQUEST} CPFs per request.` },
                { status: 400 },
            );
        }

        const service = createHubdoBulkLookupService();
        const created = await service.enqueueBulkJob({
            cpfs: normalizedCpfs,
            mode,
        });

        return NextResponse.json(
            {
                jobId: created.job.id,
                status: created.job.status,
                summary: {
                    total: created.summary.total,
                    queued: created.summary.queued,
                    processing: created.summary.processing,
                    success: created.summary.success,
                    error: created.summary.error,
                    deadLetter: created.summary.deadLetter,
                },
            },
            { status: 202 },
        );
    } catch (error) {
        if (isCpfProtectionConfigurationError(error)) {
            return NextResponse.json(
                { error: 'CPF encryption keys are missing or invalid. Set CPF_ENCRYPTION_KEY and CPF_HASH_KEY.' },
                { status: 500 },
            );
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Bulk HubDo lookup failed: ${message}` }, { status: 500 });
    }
}

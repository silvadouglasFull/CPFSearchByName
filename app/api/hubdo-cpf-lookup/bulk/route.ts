import { createHubdoCpfLookupService } from '@/hubdoCpf';
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

async function runWithConcurrency<TInput, TOutput>(
    items: TInput[],
    limit: number,
    worker: (item: TInput) => Promise<TOutput>,
): Promise<TOutput[]> {
    const results: TOutput[] = [];
    let currentIndex = 0;

    async function runWorker(): Promise<void> {
        while (currentIndex < items.length) {
            const index = currentIndex;
            currentIndex += 1;
            results[index] = await worker(items[index]!);
        }
    }

    const workers = Array.from({ length: Math.min(limit, items.length) }, () => runWorker());
    await Promise.all(workers);

    return results;
}

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

        const service = createHubdoCpfLookupService();

        const items = await runWithConcurrency(normalizedCpfs, 4, async (cpf) => {
            const result = await service.lookup({ cpf, mode });

            return {
                cpf,
                status: result.status,
                errorCode: result.errorCode,
                message: result.message,
                creditosConsumidos: result.creditosConsumidos,
                origem: result.origem,
            };
        });

        const success = items.filter((item) => item.status === 'success').length;
        const error = items.length - success;

        return NextResponse.json(
            {
                summary: {
                    total: items.length,
                    success,
                    error,
                },
                items,
            },
            { status: 200 },
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

import { FilterByCpfService } from '@/filterByCpf/application/filter-by-cpf.service';
import { JsonResultsRepository } from '@/filterByCpf/infrastructure/json-results.repository';
import { NextResponse } from 'next/server';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MIN_PARTIAL_CPF_LENGTH = 1;
const RESULTS_FILE_PATH = path.join(
    /*turbopackIgnore: true*/ process.cwd(),
    'resultados_portal.json',
);

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const partialCpf = String(searchParams.get('partialCpf') ?? '').trim();

    if (partialCpf.length < MIN_PARTIAL_CPF_LENGTH) {
        return NextResponse.json(
            { error: 'The partialCpf query parameter is required.' },
            { status: 400 },
        );
    }

    try {
        const repository = new JsonResultsRepository(RESULTS_FILE_PATH);
        const service = new FilterByCpfService(repository);
        const records = service.filterByPartialCpf(partialCpf);
        return NextResponse.json({ records }, { status: 200 });
    } catch (error) {
        if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
            return NextResponse.json(
                {
                    error: 'Data source not found. Run the collection flow first to generate resultados_portal.json.',
                },
                { status: 404 },
            );
        }

        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

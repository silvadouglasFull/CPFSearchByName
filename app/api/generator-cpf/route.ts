import { GenerateCpfCandidatesService } from '@/generatorCpf/application/generate-cpf-candidates.service';
import { normalizePartialCpf, normalizeRegionDigit } from '@/generatorCpf/domain/cpf-format.utils';
import { InvalidPartialCpfError, InvalidRegionDigitError } from '@/generatorCpf/domain/errors';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const generatorService = new GenerateCpfCandidatesService();

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const partialCpf = normalizePartialCpf(searchParams.get('partialCpf'));
    try {
        const regionDigit = normalizeRegionDigit(searchParams.get('regionDigit'));
        const records = generatorService.generate(partialCpf, regionDigit);
        return NextResponse.json({ records }, { status: 200 });
    } catch (error) {
        if (error instanceof InvalidPartialCpfError || error instanceof InvalidRegionDigitError) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 },
            );
        }

        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

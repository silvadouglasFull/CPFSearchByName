import { getCpfsByNameSearchRecords } from '@/database/schema';
import { ilike } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextResponse } from 'next/server';
import postgres from 'postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PortalResultRecord {
    id: string;
    name: string;
    cpf: string;
    relation: string;
}

const MIN_PARTIAL_CPF_LENGTH = 1;

function extractCpfDigits(cpfString: string): string {
    const match = cpfString.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/);
    if (match) {
        return match[0].replace(/\D/g, '');
    }
    const digitsOnly = cpfString.replace(/\D/g, '');
    if (digitsOnly.length === 11) {
        return digitsOnly;
    }
    return cpfString;
}

function normalizeSearchTerm(term: string): string {
    // Remove formatação de CPF mas mantém o padrão para busca
    const withoutDots = term.replace(/\./g, '');
    const withoutDash = withoutDots.replace(/-/g, '');
    return withoutDash;
}

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
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json(
                { error: 'Database configuration missing.' },
                { status: 500 }
            );
        }

        const client = postgres(databaseUrl);
        const db = drizzle(client);

        const records = await db
            .select({
                id: getCpfsByNameSearchRecords.id,
                name: getCpfsByNameSearchRecords.name,
                cpf: getCpfsByNameSearchRecords.cpf,
                relation: getCpfsByNameSearchRecords.relation,
            })
            .from(getCpfsByNameSearchRecords)
            .where(
                ilike(getCpfsByNameSearchRecords.cpf, `%${normalizeSearchTerm(partialCpf)}%`)
            );

        await client.end();

        const mappedRecords: PortalResultRecord[] = records.map((record) => ({
            id: record.id,
            name: record.name,
            cpf: extractCpfDigits(record.cpf),
            relation: record.relation,
        }));

        return NextResponse.json({ records: mappedRecords }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json(
            { error: `Failed to fetch CPF records: ${message}` },
            { status: 500 }
        );
    }
}

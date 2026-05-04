import { getCpfsByNameSearchRecords } from '@/database/schema';
import { ilike, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextResponse } from 'next/server';
import postgres from 'postgres';

interface CpfRecord {
    id: string;
    name: string;
    cpf: string;
    relation: string;
}

const DEFAULT_LIMIT = 50;

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
    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT)), 100);
        const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));
        const searchTerm = (searchParams.get('search') || '').trim();

        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            return NextResponse.json(
                { error: 'Database configuration missing.' },
                { status: 500 }
            );
        }

        const client = postgres(databaseUrl);
        const db = drizzle(client);

        const whereConditions = searchTerm
            ? or(
                ilike(getCpfsByNameSearchRecords.name, `%${searchTerm}%`),
                ilike(getCpfsByNameSearchRecords.cpf, `%${normalizeSearchTerm(searchTerm)}%`)
            )
            : undefined;

        const records = await db
            .select({
                id: getCpfsByNameSearchRecords.id,
                name: getCpfsByNameSearchRecords.name,
                cpf: getCpfsByNameSearchRecords.cpf,
                relation: getCpfsByNameSearchRecords.relation,
            })
            .from(getCpfsByNameSearchRecords)
            .where(whereConditions)
            .limit(limit)
            .offset(offset);

        await client.end();

        const mappedRecords: CpfRecord[] = records.map((record) => ({
            id: record.id,
            name: record.name,
            cpf: extractCpfDigits(record.cpf),
            relation: record.relation,
        }));

        return NextResponse.json(
            { records: mappedRecords, limit, offset },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json(
            { error: `Failed to fetch CPF records: ${message}` },
            { status: 500 }
        );
    }
}

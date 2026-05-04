import { generatorCpfHistoryRecords } from '@/database/schema';
import { ilike, or } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import { NextResponse } from 'next/server';
import postgres from 'postgres';

interface CpfRecord {
    id: string;
    cpf: string;
    formattedCpf: string;
    baseNineDigits: string;
}

const DEFAULT_LIMIT = 50;

function extractBaseNineDigits(cpfString: string): string {
    const digitsOnly = cpfString.replace(/\D/g, '');
    if (digitsOnly.length >= 9) {
        return digitsOnly.substring(0, 9);
    }
    return digitsOnly;
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
                ilike(generatorCpfHistoryRecords.cpf, `%${searchTerm}%`),
                ilike(generatorCpfHistoryRecords.formattedCpf, `%${searchTerm}%`),
                ilike(generatorCpfHistoryRecords.baseNineDigits, `%${searchTerm}%`)
            )
            : undefined;

        const records = await db
            .select({
                id: generatorCpfHistoryRecords.id,
                cpf: generatorCpfHistoryRecords.cpf,
                formattedCpf: generatorCpfHistoryRecords.formattedCpf,
                baseNineDigits: generatorCpfHistoryRecords.baseNineDigits,
            })
            .from(generatorCpfHistoryRecords)
            .where(whereConditions)
            .limit(limit)
            .offset(offset);

        await client.end();

        const mappedRecords: CpfRecord[] = records.map((record) => ({
            id: record.id,
            cpf: record.cpf,
            formattedCpf: record.formattedCpf,
            baseNineDigits: extractBaseNineDigits(record.baseNineDigits),
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

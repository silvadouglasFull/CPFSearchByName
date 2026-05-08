import {
    CreateCredifyPhoneLookupInput,
    CredifyPhoneLookupHistoryParams,
    CredifyPhoneLookupRecord,
    CredifyPhoneLookupRepository,
    PaginatedCredifyPhoneLookupHistory,
} from '@/credifyApis/domain/types';
import { db } from '@/database/db';
import { credifyPhoneLookups } from '@/database/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export class DrizzleCredifyPhoneLookupRepository implements CredifyPhoneLookupRepository {
    async save(input: CreateCredifyPhoneLookupInput): Promise<CredifyPhoneLookupRecord> {
        const rows = await db
            .insert(credifyPhoneLookups)
            .values({
                jobId: input.jobId ?? null,
                jobItemId: input.jobItemId ?? null,
                rawPhone: input.rawPhone,
                normalizedPhone: input.normalizedPhone,
                ddd: input.ddd,
                localNumber: input.localNumber,
                providerQueryId: input.providerQueryId,
                status: input.status,
                providerCode: input.providerCode ?? null,
                providerMessage: input.providerMessage ?? null,
                cpf: input.cpf ?? null,
                nome: input.nome ?? null,
                tpLogradouro: input.tpLogradouro ?? null,
                logradouro: input.logradouro ?? null,
                numero: input.numero ?? null,
                endereco: input.endereco ?? null,
                complemento: input.complemento ?? null,
                bairro: input.bairro ?? null,
                cidade: input.cidade ?? null,
                uf: input.uf ?? null,
                cep: input.cep ?? null,
                phoneType: input.phoneType ?? null,
                errorCode: input.errorCode ?? null,
                errorMessage: input.errorMessage ?? null,
                rawResponse: (input.rawResponse ?? null) as Record<string, unknown> | null,
                updatedAt: new Date(),
                finishedAt: input.finishedAt ?? null,
            })
            .onConflictDoUpdate({
                target: credifyPhoneLookups.providerQueryId,
                set: {
                    jobId: input.jobId ?? null,
                    jobItemId: input.jobItemId ?? null,
                    status: input.status,
                    providerCode: input.providerCode ?? null,
                    providerMessage: input.providerMessage ?? null,
                    cpf: input.cpf ?? null,
                    nome: input.nome ?? null,
                    tpLogradouro: input.tpLogradouro ?? null,
                    logradouro: input.logradouro ?? null,
                    numero: input.numero ?? null,
                    endereco: input.endereco ?? null,
                    complemento: input.complemento ?? null,
                    bairro: input.bairro ?? null,
                    cidade: input.cidade ?? null,
                    uf: input.uf ?? null,
                    cep: input.cep ?? null,
                    phoneType: input.phoneType ?? null,
                    errorCode: input.errorCode ?? null,
                    errorMessage: input.errorMessage ?? null,
                    rawResponse: (input.rawResponse ?? null) as Record<string, unknown> | null,
                    updatedAt: new Date(),
                    finishedAt: input.finishedAt ?? null,
                },
            })
            .returning();

        const row = rows[0];
        if (!row) {
            throw new Error('Failed to save Credify lookup record.');
        }

        return this.map(row);
    }

    async getByProviderQueryId(providerQueryId: string): Promise<CredifyPhoneLookupRecord | null> {
        const rows = await db
            .select()
            .from(credifyPhoneLookups)
            .where(eq(credifyPhoneLookups.providerQueryId, providerQueryId))
            .limit(1);

        return rows[0] ? this.map(rows[0]) : null;
    }

    async list(params: CredifyPhoneLookupHistoryParams): Promise<PaginatedCredifyPhoneLookupHistory> {
        const page = Math.max(1, params.page);
        const pageSize = Math.min(100, Math.max(1, params.pageSize));
        const offset = (page - 1) * pageSize;

        const whereClause = params.phone && params.status
            ? and(
                eq(credifyPhoneLookups.normalizedPhone, params.phone),
                eq(credifyPhoneLookups.status, params.status),
            )
            : params.phone
                ? eq(credifyPhoneLookups.normalizedPhone, params.phone)
                : params.status
                    ? eq(credifyPhoneLookups.status, params.status)
                    : undefined;

        const items = whereClause
            ? await db
                .select()
                .from(credifyPhoneLookups)
                .where(whereClause)
                .orderBy(desc(credifyPhoneLookups.createdAt))
                .limit(pageSize)
                .offset(offset)
            : await db
                .select()
                .from(credifyPhoneLookups)
                .orderBy(desc(credifyPhoneLookups.createdAt))
                .limit(pageSize)
                .offset(offset);

        const totalRows = whereClause
            ? await db
                .select({ value: sql<number>`count(*)` })
                .from(credifyPhoneLookups)
                .where(whereClause)
            : await db
                .select({ value: sql<number>`count(*)` })
                .from(credifyPhoneLookups);

        const totalItems = Number(totalRows[0]?.value ?? 0);

        return {
            items: items.map((item) => this.map(item)),
            page,
            pageSize,
            totalItems,
            totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
        };
    }

    private map(row: typeof credifyPhoneLookups.$inferSelect): CredifyPhoneLookupRecord {
        return {
            id: row.id,
            jobId: row.jobId ?? undefined,
            jobItemId: row.jobItemId ?? undefined,
            rawPhone: row.rawPhone,
            normalizedPhone: row.normalizedPhone,
            ddd: row.ddd,
            localNumber: row.localNumber,
            providerQueryId: row.providerQueryId,
            status: row.status as CredifyPhoneLookupRecord['status'],
            providerCode: row.providerCode ?? undefined,
            providerMessage: row.providerMessage ?? undefined,
            cpf: row.cpf ?? undefined,
            nome: row.nome ?? undefined,
            tpLogradouro: row.tpLogradouro ?? undefined,
            logradouro: row.logradouro ?? undefined,
            numero: row.numero ?? undefined,
            endereco: row.endereco ?? undefined,
            complemento: row.complemento ?? undefined,
            bairro: row.bairro ?? undefined,
            cidade: row.cidade ?? undefined,
            uf: row.uf ?? undefined,
            cep: row.cep ?? undefined,
            phoneType: row.phoneType ?? undefined,
            errorCode: row.errorCode ?? undefined,
            errorMessage: row.errorMessage ?? undefined,
            rawResponse: row.rawResponse ?? undefined,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            finishedAt: row.finishedAt ?? undefined,
        };
    }
}

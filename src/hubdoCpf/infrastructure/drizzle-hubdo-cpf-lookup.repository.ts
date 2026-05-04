/**
 * Drizzle Repository for HubDo CPF Lookups
 * Handles database persistence of lookup operations
 */

import { db } from '@/database/db';
import { hubdoCpfLookups } from '@/database/schema';
import {
    CreateHubdoCpfLookupInput,
    HubdoCpfLookupHistoryListParams,
    HubdoCpfLookupRecord,
    HubdoCpfLookupRepository,
    PaginatedHubdoCpfLookupHistory,
} from '@/hubdoCpf/domain/types';
import { desc, eq, ilike, sql } from 'drizzle-orm';

export class DrizzleHubdoCpfLookupRepository implements HubdoCpfLookupRepository {
    async save(lookup: CreateHubdoCpfLookupInput): Promise<HubdoCpfLookupRecord> {
        const inserted = await db
            .insert(hubdoCpfLookups)
            .values({
                cpf: lookup.cpf,
                birthDate: lookup.birthDate,
                queryMode: lookup.queryMode,
                requestStatus: lookup.requestStatus,
                errorCode: lookup.errorCode,
                errorMessage: lookup.errorMessage,
                responseName: lookup.responseName,
                responseBirthDate: lookup.responseBirthDate,
                responseCadastralStatus: lookup.responseCadastralStatus,
                responseInscriptionDate: lookup.responseInscriptionDate,
                responseCheckDigit: lookup.responseCheckDigit,
                responseProof: lookup.responseProof,
                responseProofDate: lookup.responseProofDate,
                creditosConsumidos: lookup.creditosConsumidos,
                origem: lookup.origem,
                fullResponse: lookup.fullResponse,
            })
            .returning();

        const record = inserted[0];
        if (!record) {
            throw new Error('Failed to save HubDo CPF lookup');
        }

        return this.mapRecord(record);
    }

    async getById(id: string): Promise<HubdoCpfLookupRecord | null> {
        const records = await db
            .select()
            .from(hubdoCpfLookups)
            .where(eq(hubdoCpfLookups.id, id))
            .limit(1);

        if (!records[0]) {
            return null;
        }

        return this.mapRecord(records[0]);
    }

    async listByCpf(cpf: string): Promise<HubdoCpfLookupRecord[]> {
        const records = await db
            .select()
            .from(hubdoCpfLookups)
            .where(eq(hubdoCpfLookups.cpf, cpf))
            .orderBy(desc(hubdoCpfLookups.createdAt));

        return records.map((record) => this.mapRecord(record));
    }

    async getLatestByCpf(cpf: string): Promise<HubdoCpfLookupRecord | null> {
        const records = await db
            .select()
            .from(hubdoCpfLookups)
            .where(eq(hubdoCpfLookups.cpf, cpf))
            .orderBy(desc(hubdoCpfLookups.createdAt))
            .limit(1);

        if (!records[0]) {
            return null;
        }

        return this.mapRecord(records[0]);
    }

    async list(params: HubdoCpfLookupHistoryListParams): Promise<PaginatedHubdoCpfLookupHistory> {
        const page = Math.max(1, params.page);
        const pageSize = Math.max(1, params.pageSize);
        const offset = (page - 1) * pageSize;
        const cpfFilter = params.cpf?.trim();
        const whereCondition = cpfFilter ? ilike(hubdoCpfLookups.cpf, `%${cpfFilter.replace(/\D/g, '')}%`) : undefined;

        const itemsResult = await db
            .select()
            .from(hubdoCpfLookups)
            .where(whereCondition)
            .orderBy(desc(hubdoCpfLookups.createdAt))
            .limit(pageSize)
            .offset(offset);

        const totalResult = await db
            .select({ value: sql<number>`count(*)` })
            .from(hubdoCpfLookups)
            .where(whereCondition);

        const totalItems = Number(totalResult[0]?.value ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        return {
            items: itemsResult.map((record) => this.mapRecord(record)),
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    private mapRecord(record: typeof hubdoCpfLookups.$inferSelect): HubdoCpfLookupRecord {
        return {
            id: record.id,
            cpf: record.cpf,
            birthDate: record.birthDate ?? undefined,
            queryMode: record.queryMode as 'normal' | 'turbo',
            requestStatus: record.requestStatus as 'OK' | 'NOK',
            errorCode: record.errorCode ?? undefined,
            errorMessage: record.errorMessage ?? undefined,
            responseName: record.responseName ?? undefined,
            responseBirthDate: record.responseBirthDate ?? undefined,
            responseCadastralStatus: record.responseCadastralStatus ?? undefined,
            responseInscriptionDate: record.responseInscriptionDate ?? undefined,
            responseCheckDigit: record.responseCheckDigit ?? undefined,
            responseProof: record.responseProof ?? undefined,
            responseProofDate: record.responseProofDate ?? undefined,
            creditosConsumidos: record.creditosConsumidos,
            origem: record.origem,
            fullResponse: record.fullResponse as Record<string, unknown> | undefined,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }
}

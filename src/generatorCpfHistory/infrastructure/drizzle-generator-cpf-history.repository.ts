import { db } from '@/database/db';
import { generatorCpfHistory, generatorCpfHistoryRecords, hubdoCpfLookups } from '@/database/schema';
import {
    CreateGeneratorCpfHistoryInput,
    GeneratorCpfHistoryListParams,
    GeneratorCpfHistoryRecord,
    GeneratorCpfHistoryRecordLookupInfo,
    GeneratorCpfHistoryRecordWithLookup,
    GeneratorCpfHistoryRepository,
    PaginatedGeneratorCpfHistory,
    UpdateGeneratorCpfHistoryInput,
} from '@/generatorCpfHistory/domain/types';
import { asc, desc, eq, sql } from 'drizzle-orm';

export class DrizzleGeneratorCpfHistoryRepository implements GeneratorCpfHistoryRepository {
    async create(input: CreateGeneratorCpfHistoryInput): Promise<GeneratorCpfHistoryRecord> {
        return db.transaction(async (tx) => {
            const insertedSnapshot = await tx
                .insert(generatorCpfHistory)
                .values({
                    partialCpf: input.partialCpf,
                    stateRegionDigit: input.stateRegionDigit ?? null,
                    resultCount: input.resultRecords.length,
                })
                .returning();

            const snapshot = insertedSnapshot[0]!;

            if (input.resultRecords.length > 0) {
                await tx
                    .insert(generatorCpfHistoryRecords)
                    .values(
                        input.resultRecords.map((record) => ({
                            historyId: snapshot.id,
                            cpf: record.cpf,
                            formattedCpf: record.formattedCpf,
                            baseNineDigits: record.baseNineDigits,
                        })),
                    );
            }

            const records = await tx
                .select()
                .from(generatorCpfHistoryRecords)
                .where(eq(generatorCpfHistoryRecords.historyId, snapshot.id))
                .orderBy(asc(generatorCpfHistoryRecords.createdAt));

            return this.mapRecord(snapshot, records);
        });
    }

    async getById(id: string): Promise<GeneratorCpfHistoryRecord | null> {
        const snapshot = await db
            .select()
            .from(generatorCpfHistory)
            .where(eq(generatorCpfHistory.id, id))
            .limit(1);

        if (!snapshot[0]) {
            return null;
        }

        const records = await db
            .select()
            .from(generatorCpfHistoryRecords)
            .where(eq(generatorCpfHistoryRecords.historyId, id))
            .orderBy(asc(generatorCpfHistoryRecords.createdAt));

        return this.mapRecord(snapshot[0], records);
    }

    async listRecordsWithLookupByHistoryId(historyId: string): Promise<GeneratorCpfHistoryRecordWithLookup[]> {
        const rows = await db
            .select({
                record: generatorCpfHistoryRecords,
                lookup: hubdoCpfLookups,
            })
            .from(generatorCpfHistoryRecords)
            .leftJoin(hubdoCpfLookups, eq(generatorCpfHistoryRecords.hubdoLookupId, hubdoCpfLookups.id))
            .where(eq(generatorCpfHistoryRecords.historyId, historyId))
            .orderBy(asc(generatorCpfHistoryRecords.createdAt));

        return rows.map(({ record, lookup }) => {
            const mappedLookup: GeneratorCpfHistoryRecordLookupInfo | null = lookup
                ? {
                    id: lookup.id,
                    requestStatus: lookup.requestStatus as 'OK' | 'NOK',
                    queryMode: lookup.queryMode as 'normal' | 'turbo',
                    errorCode: lookup.errorCode ?? undefined,
                    errorMessage: lookup.errorMessage ?? undefined,
                    responseName: lookup.responseName ?? undefined,
                    responseBirthDate: lookup.responseBirthDate ?? undefined,
                    responseCadastralStatus: lookup.responseCadastralStatus ?? undefined,
                    creditosConsumidos: lookup.creditosConsumidos,
                    origem: lookup.origem as 'database' | 'receita_federal' | 'turbo',
                    createdAt: lookup.createdAt,
                }
                : null;

            return {
                cpf: record.cpf,
                formattedCpf: record.formattedCpf,
                baseNineDigits: record.baseNineDigits,
                hubdoLookupId: record.hubdoLookupId ?? null,
                alreadyVerified: record.hubdoLookupId !== null,
                hubdoLookup: mappedLookup,
            };
        });
    }

    async linkLookupForCpfRecords(cpf: string, hubdoLookupId: string): Promise<number> {
        const updated = await db
            .update(generatorCpfHistoryRecords)
            .set({ hubdoLookupId })
            .where(eq(generatorCpfHistoryRecords.cpf, cpf))
            .returning({ id: generatorCpfHistoryRecords.id });

        return updated.length;
    }

    async update(id: string, updates: UpdateGeneratorCpfHistoryInput): Promise<GeneratorCpfHistoryRecord | null> {
        return db.transaction(async (tx) => {
            const current = await tx
                .select()
                .from(generatorCpfHistory)
                .where(eq(generatorCpfHistory.id, id))
                .limit(1);

            if (!current[0]) {
                return null;
            }

            const setValues: Partial<{
                partialCpf: string;
                stateRegionDigit: string | null;
                resultCount: number;
                updatedAt: Date;
            }> = {
                updatedAt: new Date(),
            };

            if (updates.partialCpf !== undefined) {
                setValues.partialCpf = updates.partialCpf;
            }

            if (updates.stateRegionDigit !== undefined) {
                setValues.stateRegionDigit = updates.stateRegionDigit;
            }

            if (updates.resultRecords !== undefined) {
                setValues.resultCount = updates.resultRecords.length;
            }

            await tx
                .update(generatorCpfHistory)
                .set(setValues)
                .where(eq(generatorCpfHistory.id, id));

            if (updates.resultRecords !== undefined) {
                await tx
                    .delete(generatorCpfHistoryRecords)
                    .where(eq(generatorCpfHistoryRecords.historyId, id));

                if (updates.resultRecords.length > 0) {
                    await tx
                        .insert(generatorCpfHistoryRecords)
                        .values(
                            updates.resultRecords.map((record) => ({
                                historyId: id,
                                cpf: record.cpf,
                                formattedCpf: record.formattedCpf,
                                baseNineDigits: record.baseNineDigits,
                            })),
                        );
                }
            }

                const updatedSnapshot = await tx
                    .select()
                    .from(generatorCpfHistory)
                    .where(eq(generatorCpfHistory.id, id))
                    .limit(1);

                if (!updatedSnapshot[0]) {
                    return null;
                }

                const updatedRecords = await tx
                    .select()
                    .from(generatorCpfHistoryRecords)
                    .where(eq(generatorCpfHistoryRecords.historyId, id))
                    .orderBy(asc(generatorCpfHistoryRecords.createdAt));

                return this.mapRecord(updatedSnapshot[0], updatedRecords);
        });
    }

    async delete(id: string): Promise<boolean> {
        const result = await db
            .delete(generatorCpfHistory)
            .where(eq(generatorCpfHistory.id, id))
            .returning({ id: generatorCpfHistory.id });

        return result.length > 0;
    }

    async list(params: GeneratorCpfHistoryListParams): Promise<PaginatedGeneratorCpfHistory> {
        const page = Math.max(1, params.page);
        const pageSize = Math.max(1, params.pageSize);
        const offset = (page - 1) * pageSize;

        const itemsResult = await db
            .select()
            .from(generatorCpfHistory)
            .orderBy(desc(generatorCpfHistory.createdAt))
            .limit(pageSize)
            .offset(offset);

        const totalResult = await db
            .select({ value: sql<number>`count(*)` })
            .from(generatorCpfHistory);

        const totalItems = Number(totalResult[0]?.value ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        return {
            items: itemsResult.map((item) => this.mapSummaryRecord(item)),
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    private mapRecord(
        snapshot: typeof generatorCpfHistory.$inferSelect,
        recordRows: Array<typeof generatorCpfHistoryRecords.$inferSelect>,
    ): GeneratorCpfHistoryRecord {
        return {
            ...snapshot,
            stateRegionDigit: snapshot.stateRegionDigit ?? null,
            resultRecords: recordRows.map((row) => ({
                cpf: row.cpf,
                formattedCpf: row.formattedCpf,
                baseNineDigits: row.baseNineDigits,
            })),
        };
    }

    private mapSummaryRecord(snapshot: typeof generatorCpfHistory.$inferSelect): GeneratorCpfHistoryRecord {
        return {
            ...snapshot,
            stateRegionDigit: snapshot.stateRegionDigit ?? null,
            resultRecords: [],
        };
    }
}

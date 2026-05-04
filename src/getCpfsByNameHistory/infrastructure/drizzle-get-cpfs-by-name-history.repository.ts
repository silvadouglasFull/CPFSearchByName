import { db } from '@/database/db';
import { getCpfsByNameSearchHistory, getCpfsByNameSearchRecords } from '@/database/schema';
import {
    CreateGetCpfsByNameHistoryInput,
    GetCpfsByNameHistoryListParams,
    GetCpfsByNameHistoryRecord,
    GetCpfsByNameHistoryRepository,
    PaginatedGetCpfsByNameHistory,
    UpdateGetCpfsByNameHistoryInput,
} from '@/getCpfsByNameHistory/domain/types';
import { asc, desc, eq, ilike, or, sql } from 'drizzle-orm';

export class DrizzleGetCpfsByNameHistoryRepository implements GetCpfsByNameHistoryRepository {
    async create(input: CreateGetCpfsByNameHistoryInput): Promise<GetCpfsByNameHistoryRecord> {
        return db.transaction(async (tx) => {
            const insertedSnapshot = await tx
                .insert(getCpfsByNameSearchHistory)
                .values({
                    searchName: input.searchName,
                    resultCount: input.records.length,
                })
                .returning();

            const snapshot = insertedSnapshot[0]!;

            if (input.records.length > 0) {
                await tx
                    .insert(getCpfsByNameSearchRecords)
                    .values(
                        input.records.map((record) => ({
                            searchId: snapshot.id,
                            name: record.name,
                            cpf: record.cpf,
                            relation: record.relation,
                            detailsLink: record.detailsLink,
                            sourcePage: record.sourcePage,
                        })),
                    );
            }

            const records = await tx
                .select()
                .from(getCpfsByNameSearchRecords)
                .where(eq(getCpfsByNameSearchRecords.searchId, snapshot.id))
                .orderBy(asc(getCpfsByNameSearchRecords.createdAt));

            return this.mapRecord(snapshot, records);
        });
    }

    async getById(id: string): Promise<GetCpfsByNameHistoryRecord | null> {
        const snapshot = await db
            .select()
            .from(getCpfsByNameSearchHistory)
            .where(eq(getCpfsByNameSearchHistory.id, id))
            .limit(1);

        if (!snapshot[0]) {
            return null;
        }

        const records = await db
            .select()
            .from(getCpfsByNameSearchRecords)
            .where(eq(getCpfsByNameSearchRecords.searchId, id))
            .orderBy(asc(getCpfsByNameSearchRecords.createdAt));

        return this.mapRecord(snapshot[0], records);
    }

    async update(id: string, updates: UpdateGetCpfsByNameHistoryInput): Promise<GetCpfsByNameHistoryRecord | null> {
        return db.transaction(async (tx) => {
            const current = await tx
                .select()
                .from(getCpfsByNameSearchHistory)
                .where(eq(getCpfsByNameSearchHistory.id, id))
                .limit(1);

            if (!current[0]) {
                return null;
            }

            const setValues: Partial<{
                searchName: string;
                resultCount: number;
                updatedAt: Date;
            }> = {
                updatedAt: new Date(),
            };

            if (updates.searchName !== undefined) {
                setValues.searchName = updates.searchName;
            }

            if (updates.records !== undefined) {
                setValues.resultCount = updates.records.length;
            }

            await tx
                .update(getCpfsByNameSearchHistory)
                .set(setValues)
                .where(eq(getCpfsByNameSearchHistory.id, id));

            if (updates.records !== undefined) {
                await tx
                    .delete(getCpfsByNameSearchRecords)
                    .where(eq(getCpfsByNameSearchRecords.searchId, id));

                if (updates.records.length > 0) {
                    await tx
                        .insert(getCpfsByNameSearchRecords)
                        .values(
                            updates.records.map((record) => ({
                                searchId: id,
                                name: record.name,
                                cpf: record.cpf,
                                relation: record.relation,
                                detailsLink: record.detailsLink,
                                sourcePage: record.sourcePage,
                            })),
                        );
                }
            }

            const updatedSnapshot = await tx
                .select()
                .from(getCpfsByNameSearchHistory)
                .where(eq(getCpfsByNameSearchHistory.id, id))
                .limit(1);

            if (!updatedSnapshot[0]) {
                return null;
            }

            const updatedRecords = await tx
                .select()
                .from(getCpfsByNameSearchRecords)
                .where(eq(getCpfsByNameSearchRecords.searchId, id))
                .orderBy(asc(getCpfsByNameSearchRecords.createdAt));

            return this.mapRecord(updatedSnapshot[0], updatedRecords);
        });
    }

    async delete(id: string): Promise<boolean> {
        const result = await db
            .delete(getCpfsByNameSearchHistory)
            .where(eq(getCpfsByNameSearchHistory.id, id))
            .returning({ id: getCpfsByNameSearchHistory.id });

        return result.length > 0;
    }

    async searchByCpfOrName(
        query: string,
        limit: number = 50,
        offset: number = 0,
    ): Promise<Array<typeof getCpfsByNameSearchRecords.$inferSelect>> {
        const normalizedQuery = query.trim();
        if (!normalizedQuery) {
            return [];
        }

        return db
            .select()
            .from(getCpfsByNameSearchRecords)
            .where(
                or(
                    ilike(getCpfsByNameSearchRecords.name, `%${normalizedQuery}%`),
                    ilike(getCpfsByNameSearchRecords.cpf, `%${normalizedQuery}%`),
                ),
            )
            .limit(limit)
            .offset(offset);
    }

    async list(params: GetCpfsByNameHistoryListParams): Promise<PaginatedGetCpfsByNameHistory> {
        const page = Math.max(1, params.page);
        const pageSize = Math.max(1, params.pageSize);
        const offset = (page - 1) * pageSize;

        const itemsResult = await db
            .select()
            .from(getCpfsByNameSearchHistory)
            .orderBy(desc(getCpfsByNameSearchHistory.createdAt))
            .limit(pageSize)
            .offset(offset);

        const totalResult = await db
            .select({ value: sql<number>`count(*)` })
            .from(getCpfsByNameSearchHistory);

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
        snapshot: typeof getCpfsByNameSearchHistory.$inferSelect,
        recordRows: Array<typeof getCpfsByNameSearchRecords.$inferSelect>,
    ): GetCpfsByNameHistoryRecord {
        return {
            ...snapshot,
            records: recordRows.map((row) => ({
                name: row.name,
                cpf: row.cpf,
                relation: row.relation,
                detailsLink: row.detailsLink,
                sourcePage: row.sourcePage,
            })),
        };
    }

    private mapSummaryRecord(snapshot: typeof getCpfsByNameSearchHistory.$inferSelect): GetCpfsByNameHistoryRecord {
        return {
            ...snapshot,
            records: [],
        };
    }
}

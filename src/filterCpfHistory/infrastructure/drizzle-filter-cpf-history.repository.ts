import { db } from '@/database/db';
import { filterCpfSearchHistory } from '@/database/schema';
import { PortalResultRecord } from '@/filterByCpf/domain/types';
import {
    CreateFilterCpfHistoryInput,
    FilterCpfHistoryListParams,
    FilterCpfHistoryRecord,
    FilterCpfHistoryRepository,
    PaginatedFilterCpfHistory,
    UpdateFilterCpfHistoryInput,
} from '@/filterCpfHistory/domain/types';
import { desc, eq, sql } from 'drizzle-orm';

export class DrizzleFilterCpfHistoryRepository implements FilterCpfHistoryRepository {
    async create(input: CreateFilterCpfHistoryInput): Promise<FilterCpfHistoryRecord> {
        const result = await db
            .insert(filterCpfSearchHistory)
            .values({
                searchTerm: input.searchTerm,
                resultRecords: input.resultRecords,
                resultCount: input.resultRecords.length,
            })
            .returning();

        return result[0] as FilterCpfHistoryRecord;
    }

    async getById(id: string): Promise<FilterCpfHistoryRecord | null> {
        const result = await db
            .select()
            .from(filterCpfSearchHistory)
            .where(eq(filterCpfSearchHistory.id, id))
            .limit(1);

        if (!result[0]) {
            return null;
        }

        return this.mapRecord(result[0]);
    }

    async update(id: string, updates: UpdateFilterCpfHistoryInput): Promise<FilterCpfHistoryRecord | null> {
        const setValues: Partial<{ searchTerm: string; resultRecords: PortalResultRecord[]; resultCount: number; updatedAt: Date }> = {
            updatedAt: new Date(),
        };

        if (updates.searchTerm !== undefined) {
            setValues.searchTerm = updates.searchTerm;
        }

        if (updates.resultRecords !== undefined) {
            setValues.resultRecords = updates.resultRecords;
            setValues.resultCount = updates.resultRecords.length;
        }

        const result = await db
            .update(filterCpfSearchHistory)
            .set(setValues)
            .where(eq(filterCpfSearchHistory.id, id))
            .returning();

        if (!result[0]) {
            return null;
        }

        return this.mapRecord(result[0]);
    }

    async delete(id: string): Promise<boolean> {
        const result = await db
            .delete(filterCpfSearchHistory)
            .where(eq(filterCpfSearchHistory.id, id))
            .returning({ id: filterCpfSearchHistory.id });

        return result.length > 0;
    }

    async list(params: FilterCpfHistoryListParams): Promise<PaginatedFilterCpfHistory> {
        const page = Math.max(1, params.page);
        const pageSize = Math.max(1, params.pageSize);
        const offset = (page - 1) * pageSize;

        const itemsResult = await db
            .select()
            .from(filterCpfSearchHistory)
            .orderBy(desc(filterCpfSearchHistory.createdAt))
            .limit(pageSize)
            .offset(offset);

        const totalResult = await db
            .select({ value: sql<number>`count(*)` })
            .from(filterCpfSearchHistory);

        const totalItems = Number(totalResult[0]?.value ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

        return {
            items: itemsResult.map((item) => this.mapRecord(item)),
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    private mapRecord(row: typeof filterCpfSearchHistory.$inferSelect): FilterCpfHistoryRecord {
        return {
            ...row,
            resultRecords: (row.resultRecords as PortalResultRecord[]) ?? [],
        };
    }
}

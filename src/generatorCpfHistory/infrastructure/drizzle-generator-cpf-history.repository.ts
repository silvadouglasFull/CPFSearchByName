import { db } from '@/database/db';
import { generatorCpfHistory } from '@/database/schema';
import { GeneratedCpfRecord } from '@/generatorCpf/domain/types';
import {
    CreateGeneratorCpfHistoryInput,
    GeneratorCpfHistoryListParams,
    GeneratorCpfHistoryRecord,
    GeneratorCpfHistoryRepository,
    PaginatedGeneratorCpfHistory,
    UpdateGeneratorCpfHistoryInput,
} from '@/generatorCpfHistory/domain/types';
import { desc, eq, sql } from 'drizzle-orm';

export class DrizzleGeneratorCpfHistoryRepository implements GeneratorCpfHistoryRepository {
    async create(input: CreateGeneratorCpfHistoryInput): Promise<GeneratorCpfHistoryRecord> {
        const result = await db
            .insert(generatorCpfHistory)
            .values({
                partialCpf: input.partialCpf,
                stateRegionDigit: input.stateRegionDigit ?? null,
                resultRecords: input.resultRecords,
                resultCount: input.resultRecords.length,
            })
            .returning();

        return this.mapRecord(result[0]!);
    }

    async getById(id: string): Promise<GeneratorCpfHistoryRecord | null> {
        const result = await db
            .select()
            .from(generatorCpfHistory)
            .where(eq(generatorCpfHistory.id, id))
            .limit(1);

        if (!result[0]) {
            return null;
        }

        return this.mapRecord(result[0]);
    }

    async update(id: string, updates: UpdateGeneratorCpfHistoryInput): Promise<GeneratorCpfHistoryRecord | null> {
        const setValues: Partial<{
            partialCpf: string;
            stateRegionDigit: string | null;
            resultRecords: GeneratedCpfRecord[];
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
            setValues.resultRecords = updates.resultRecords;
            setValues.resultCount = updates.resultRecords.length;
        }

        const result = await db
            .update(generatorCpfHistory)
            .set(setValues)
            .where(eq(generatorCpfHistory.id, id))
            .returning();

        if (!result[0]) {
            return null;
        }

        return this.mapRecord(result[0]);
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
            items: itemsResult.map((item) => this.mapRecord(item)),
            page,
            pageSize,
            totalItems,
            totalPages,
        };
    }

    private mapRecord(row: typeof generatorCpfHistory.$inferSelect): GeneratorCpfHistoryRecord {
        return {
            ...row,
            stateRegionDigit: row.stateRegionDigit ?? null,
            resultRecords: (row.resultRecords as GeneratedCpfRecord[]) ?? [],
        };
    }
}

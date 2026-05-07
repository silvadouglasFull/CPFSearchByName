import 'dotenv/config';

import { eq, isNull, or } from 'drizzle-orm';
import { db } from '../src/database/db';
import { hubdoCpfLookups } from '../src/database/schema';
import { hashCpf, isValidCpf, normalizeCpf } from '../src/security/cpf-protection';

const BATCH_SIZE = 250;

async function main(): Promise<void> {
    let totalUpdated = 0;
    let totalSkipped = 0;

    for (; ;) {
        const rows = await db
            .select({
                id: hubdoCpfLookups.id,
                cpf: hubdoCpfLookups.cpf,
            })
            .from(hubdoCpfLookups)
            .where(or(isNull(hubdoCpfLookups.cpfEncrypted), isNull(hubdoCpfLookups.cpfHash)))
            .limit(BATCH_SIZE);

        if (rows.length === 0) {
            break;
        }

        for (const row of rows) {
            const normalizedCpf = normalizeCpf(row.cpf);

            if (!isValidCpf(normalizedCpf)) {
                totalSkipped += 1;
                continue;
            }

            await db
                .update(hubdoCpfLookups)
                .set({
                    cpf: normalizedCpf,
                    cpfEncrypted: normalizedCpf,
                    cpfHash: hashCpf(normalizedCpf),
                    updatedAt: new Date(),
                })
                .where(eq(hubdoCpfLookups.id, row.id));

            totalUpdated += 1;
        }
    }

    console.log('HubDo CPF encryption backfill finished.');
    console.log(`updated=${totalUpdated}`);
    console.log(`skipped=${totalSkipped}`);
}

main().catch((error) => {
    console.error('Failed to backfill HubDo CPF encryption:', error);
    process.exit(1);
});
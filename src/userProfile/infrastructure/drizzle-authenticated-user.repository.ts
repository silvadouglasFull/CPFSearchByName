import { db } from '@/database/db';
import { authenticatedUsers } from '@/database/schema';
import {
    AuthenticatedUser,
    AuthenticatedUserRepository,
    PersistAuthenticatedUserInput,
} from '@/userProfile/domain/types';
import { eq } from 'drizzle-orm';

export class DrizzleAuthenticatedUserRepository implements AuthenticatedUserRepository {
    async upsertFromGoogleProfile(input: PersistAuthenticatedUserInput): Promise<AuthenticatedUser> {
        const result = await db
            .insert(authenticatedUsers)
            .values({
                email: input.email,
                name: input.name,
                profilePicture: input.profilePicture,
            })
            .onConflictDoUpdate({
                target: authenticatedUsers.email,
                set: {
                    name: input.name,
                    profilePicture: input.profilePicture,
                },
            })
            .returning();

        return result[0]!;
    }

    async findByEmail(email: string): Promise<AuthenticatedUser | null> {
        const result = await db
            .select()
            .from(authenticatedUsers)
            .where(eq(authenticatedUsers.email, email))
            .limit(1);

        return result[0] ?? null;
    }
}

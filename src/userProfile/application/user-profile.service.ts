import {
    AuthenticatedUser,
    AuthenticatedUserRepository,
    PersistAuthenticatedUserInput,
} from '@/userProfile/domain/types';

export class UserProfileService {
    constructor(private readonly repository: AuthenticatedUserRepository) { }

    async persistAuthenticatedUser(input: PersistAuthenticatedUserInput): Promise<AuthenticatedUser> {
        const normalizedEmail = input.email.trim().toLowerCase();

        if (!normalizedEmail) {
            throw new Error('Google profile email is required to persist authenticated user.');
        }

        const normalizedName = input.name.trim() || normalizedEmail;

        return this.repository.upsertFromGoogleProfile({
            ...input,
            email: normalizedEmail,
            name: normalizedName,
        });
    }

    async getCurrentUserProfile(email: string): Promise<AuthenticatedUser | null> {
        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            return null;
        }

        return this.repository.findByEmail(normalizedEmail);
    }
}

export interface AuthenticatedUser {
    id: string;
    name: string;
    profilePicture: string | null;
    email: string;
}

export interface PersistAuthenticatedUserInput {
    name: string;
    profilePicture: string | null;
    email: string;
}

export interface AuthenticatedUserRepository {
    upsertFromGoogleProfile(input: PersistAuthenticatedUserInput): Promise<AuthenticatedUser>;
    findByEmail(email: string): Promise<AuthenticatedUser | null>;
}

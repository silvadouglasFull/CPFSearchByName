import { UserProfileService } from '@/userProfile/application/user-profile.service';
import { DrizzleAuthenticatedUserRepository } from '@/userProfile/infrastructure/drizzle-authenticated-user.repository';

export type { AuthenticatedUser, AuthenticatedUserRepository, PersistAuthenticatedUserInput } from '@/userProfile/domain/types';
export { DrizzleAuthenticatedUserRepository, UserProfileService };

export function createUserProfileService(): UserProfileService {
    return new UserProfileService(new DrizzleAuthenticatedUserRepository());
}

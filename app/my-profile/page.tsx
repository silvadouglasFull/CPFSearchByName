import { authOptions } from '@/auth/auth-options';
import { UserProfileCard } from '@/components/user-profile/user-profile-card';
import { createUserProfileService } from '@/userProfile';
import type { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'My Profile | Verify Docs',
    description: 'View your authenticated profile details.',
};

export default async function MyProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        redirect('/api/auth/signin?callbackUrl=/my-profile');
    }

    const service = createUserProfileService();

    const persistedUser =
        (await service.getCurrentUserProfile(session.user.email)) ??
        (await service.persistAuthenticatedUser({
            email: session.user.email,
            name: session.user.name ?? session.user.email,
            profilePicture: session.user.image ?? null,
        }));

    return (
        <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6 md:px-8 md:py-10">
            <UserProfileCard
                email={persistedUser.email}
                name={persistedUser.name}
                profilePicture={persistedUser.profilePicture}
            />
        </main>
    );
}

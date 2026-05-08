import { createUserProfileService } from '@/userProfile';
import { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const userProfileService = createUserProfileService();

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
            authorization: {
                params: {
                    scope: 'openid email profile',
                },
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user }) {
            if (!user.email) {
                return false;
            }

            try {
                await userProfileService.persistAuthenticatedUser({
                    email: user.email,
                    name: user.name ?? user.email,
                    profilePicture: user.image ?? null,
                });
            } catch (error) {
                console.error('Failed to persist authenticated user profile:', error);
            }

            return true;
        },
    },
};

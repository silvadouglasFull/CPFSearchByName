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
        async jwt({ token, user }) {
            const existingAuthenticatedUserId =
                typeof token.authenticatedUserId === 'string' ? token.authenticatedUserId.trim() : '';

            if (existingAuthenticatedUserId) {
                return token;
            }

            const emailFromToken = typeof token.email === 'string' ? token.email.trim().toLowerCase() : '';
            const emailFromUser = typeof user?.email === 'string' ? user.email.trim().toLowerCase() : '';
            const email = emailFromToken || emailFromUser;

            if (!email) {
                return token;
            }

            try {
                if (user) {
                    const persisted = await userProfileService.persistAuthenticatedUser({
                        email,
                        name: user.name ?? email,
                        profilePicture: user.image ?? null,
                    });

                    token.authenticatedUserId = persisted.id;
                    token.email = persisted.email;
                    return token;
                }

                const existing = await userProfileService.getCurrentUserProfile(email);

                if (existing) {
                    token.authenticatedUserId = existing.id;
                    token.email = existing.email;
                }
            } catch (error) {
                console.error('Failed to attach authenticated user id to JWT:', error);
            }

            return token;
        },
    },
};

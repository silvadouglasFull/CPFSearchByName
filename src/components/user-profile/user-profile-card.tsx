"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

interface UserProfileCardProps {
    name: string;
    email: string;
    profilePicture: string | null;
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return '?';
    }

    const first = parts[0]?.[0] ?? '';
    const second = parts[1]?.[0] ?? '';
    return `${first}${second}`.toUpperCase() || '?';
}

export function UserProfileCard({ name, email, profilePicture }: UserProfileCardProps) {
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const shouldShowProfilePicture = Boolean(profilePicture) && failedImageUrl !== profilePicture;

    return (
        <Card className="w-full max-w-xl">
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>Google OAuth account details stored by the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    {shouldShowProfilePicture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            alt={`Profile picture for ${name}`}
                            className="h-16 w-16 rounded-full object-cover ring-1 ring-border"
                            height={64}
                            onError={() => setFailedImageUrl(profilePicture ?? null)}
                            src={profilePicture!}
                            width={64}
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-muted-foreground ring-1 ring-border">
                            {getInitials(name)}
                        </div>
                    )}

                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium text-foreground">{name}</p>
                    </div>
                </div>

                <div className="mt-6 space-y-1">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{email}</p>
                </div>
            </CardContent>
        </Card>
    );
}

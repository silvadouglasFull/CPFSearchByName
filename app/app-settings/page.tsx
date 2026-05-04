import { AppSettingsClient } from '@/components/app-settings/app-settings-client';
import { AppSettingsHero } from '@/components/app-settings/app-settings-hero';

export default function AppSettingsPage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
            <AppSettingsHero />
            <AppSettingsClient />
        </main>
    );
}

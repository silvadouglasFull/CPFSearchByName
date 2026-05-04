import { GetCpfsByNameClient } from '@/components/get-cpfs-by-name/get-cpfs-by-name-client';
import { GetCpfsByNameHero } from '@/components/get-cpfs-by-name/get-cpfs-by-name-hero';

export default function GetCpfsByNamePage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
            <GetCpfsByNameHero />
            <GetCpfsByNameClient />
        </main>
    );
}

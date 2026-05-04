import { GeneratorCpfClient } from '@/components/generator-cpf/generator-cpf-client';
import { GeneratorCpfHero } from '@/components/generator-cpf/generator-cpf-hero';

export default function GeneratorCpfPage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
            <GeneratorCpfHero />
            <GeneratorCpfClient />
        </main>
    );
}

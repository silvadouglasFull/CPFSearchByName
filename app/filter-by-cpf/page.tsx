import { FilterCpfClient } from '@/components/filter-by-cpf/filter-cpf-client';
import { FilterCpfHero } from '@/components/filter-by-cpf/filter-cpf-hero';

export default function FilterByCpfPage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
            <FilterCpfHero />
            <FilterCpfClient />
        </main>
    );
}

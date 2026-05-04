import { Home, Search, WandSparkles } from 'lucide-react';

export interface NavigationLink {
    label: string;
    href: string;
    icon: typeof Home;
    description: string;
}

export const NAVIGATION_LINKS: NavigationLink[] = [
    {
        label: 'Home',
        href: '/',
        icon: Home,
        description: 'Main dashboard and app overview.',
    },
    {
        label: 'Filter by CPF',
        href: '/filter-by-cpf',
        icon: Search,
        description: 'Search records using a partial CPF value.',
    },
    {
        label: 'Generate CPF',
        href: '/generator-cpf',
        icon: WandSparkles,
        description: 'Generate valid CPF candidates by partial digits.',
    },
];

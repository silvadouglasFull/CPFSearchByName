import { Home, Search } from 'lucide-react';

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
];

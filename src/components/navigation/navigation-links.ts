import { CheckCircle2, Home, Search, Settings, UserSearch, WandSparkles } from 'lucide-react';

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
    {
        label: 'Get CPFs by Name',
        href: '/get-cpfs-by-name',
        icon: UserSearch,
        description: 'Collect CPF records from portal pages by person name.',
    },
    {
        label: 'Verificação de CPF',
        href: '/hubdo-cpf-lookup',
        icon: CheckCircle2,
        description: 'Consulte CPF diretamente na Receita Federal via HubDo.',
    },
    {
        label: 'App Settings',
        href: '/app-settings',
        icon: Settings,
        description: 'View and edit global application settings.',
    },
];

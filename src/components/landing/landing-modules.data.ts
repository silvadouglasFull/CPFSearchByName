import appSettingsScreen from '@/assets/screens/app-settings.png';
import credifyPhoneLookupScreen from '@/assets/screens/credifyapis-phone-lookup.png';
import filterByCpfScreen from '@/assets/screens/filter-by-cpf.png';
import generatorCpfScreen from '@/assets/screens/generator-cpf.png';
import getCpfsByNameScreen from '@/assets/screens/get-cpfs-by-name.png';
import hubdoCpfLookupScreen from '@/assets/screens/hubdo-cpf-lookup.png';
import { NAVIGATION_LINKS, type NavigationLink } from '@/components/navigation/navigation-links';
import type { StaticImageData } from 'next/image';

interface ModuleCopy {
    title: string;
    summary: string;
    bullets: string[];
}

export interface LandingModule {
    anchorId: string;
    copy: ModuleCopy;
    link: NavigationLink;
    screen: StaticImageData;
}

const MODULE_SCREEN_BY_ROUTE: Record<string, StaticImageData> = {
    '/filter-by-cpf': filterByCpfScreen,
    '/generator-cpf': generatorCpfScreen,
    '/get-cpfs-by-name': getCpfsByNameScreen,
    '/hubdo-cpf-lookup': hubdoCpfLookupScreen,
    '/credifyapis-phone-lookup': credifyPhoneLookupScreen,
    '/app-settings': appSettingsScreen,
};

const MODULE_COPY_BY_ROUTE: Record<string, ModuleCopy> = {
    '/filter-by-cpf': {
        title: 'Partial CPF filtering',
        summary:
            'Search records using 1 to 9 CPF digits and quickly inspect matching entries with friendly empty and error states.',
        bullets: [
            'Reuses existing filter-by-cpf domain rules through API routes.',
            'Supports investigation follow-up with saved search history.',
        ],
    },
    '/generator-cpf': {
        title: 'CPF candidate generation',
        summary:
            'Generate valid CPF candidates from partial digits and optionally narrow results by region digit to improve investigation precision.',
        bullets: [
            'Displays complete CPF, formatted CPF, and base-nine digits.',
            'Supports result review and persistence for later analysis.',
        ],
    },
    '/get-cpfs-by-name': {
        title: 'Name-based CPF discovery',
        summary: 'Collect CPF records from portal pages by person name when only partial identity data is available.',
        bullets: [
            'Uses the dedicated collection flow backed by the existing module logic.',
            'Persists snapshots so users can revisit evidence without rerunning.',
        ],
    },
    '/hubdo-cpf-lookup': {
        title: 'Official CPF verification',
        summary:
            'Query Receita Federal data through HubDo to validate CPF authenticity with auditable responses and clear credit consumption.',
        bullets: ['Supports normal and turbo lookup modes.', 'Includes searchable lookup history for traceability.'],
    },
    '/credifyapis-phone-lookup': {
        title: 'Phone-based corroboration',
        summary:
            'Submit phone lookups to a queue-first Credify flow and monitor progress in real time to add another anti-fraud signal.',
        bullets: [
            'Keeps provider credentials server-side and processes asynchronously.',
            'Persists each lookup outcome for operational audit.',
        ],
    },
    '/app-settings': {
        title: 'Global runtime settings',
        summary:
            'Manage shared application configuration used by CPF collection and verification flows from a dedicated admin screen.',
        bullets: [
            'Loads persisted settings from the API and saves updates safely.',
            'Centralizes operational parameters for all users in this phase.',
        ],
    },
};

function toAnchorId(pathname: string): string {
    return `module-${pathname.replace('/', '')}`;
}

export const LANDING_MODULES: LandingModule[] = NAVIGATION_LINKS.filter((link) => link.href !== '/')
    .map((link) => {
        const copy = MODULE_COPY_BY_ROUTE[link.href];
        const screen = MODULE_SCREEN_BY_ROUTE[link.href];

        if (!copy || !screen) {
            return null;
        }

        return {
            anchorId: toAnchorId(link.href),
            copy,
            link,
            screen,
        } satisfies LandingModule;
    })
    .filter((module): module is LandingModule => module !== null);

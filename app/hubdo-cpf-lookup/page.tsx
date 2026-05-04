import { HubdoCpfLookupClient } from '@/components/hubdo-cpf-lookup/hubdo-cpf-lookup-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'HubDo CPF Lookup - Verificação de CPF',
    description: 'Consulte dados de CPF através da Receita Federal.',
};

export default function HubdoCpfLookupPage() {
    return (
        <main className="container mx-auto px-4 py-6">
            <div className="space-y-4">
                <div>
                    <h1 className="text-3xl font-bold">Verificação de CPF</h1>
                    <p className="text-muted-foreground">
                        Consulte dados oficiais de CPF através da Receita Federal.
                    </p>
                </div>
                <HubdoCpfLookupClient />
            </div>
        </main>
    );
}
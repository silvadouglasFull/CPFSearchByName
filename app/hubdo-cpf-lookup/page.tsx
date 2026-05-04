import { HubdoCpfLookupClient } from '@/components/hubdo-cpf-lookup/hubdo-cpf-lookup-client';
import { Badge } from '@/components/ui/badge';
import { Clock3, FileBadge2, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'HubDo CPF Lookup - Verificação de CPF',
    description: 'Consulte dados de CPF através da Receita Federal.',
};

export default function HubdoCpfLookupPage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
            <header className="overflow-hidden rounded-3xl border bg-card shadow-sm">
                <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.3fr_0.9fr] md:px-8 md:py-8">
                    <div className="space-y-4">
                        <Badge className="rounded-full" variant="secondary">
                            HubDo + Receita Federal
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                Verificação oficial de CPF
                            </h1>
                            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                                Consulte dados cadastrais com retorno auditável, histórico pesquisável e transparência de
                                consumo por crédito em cada consulta.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 rounded-3xl border bg-linear-to-br from-muted/20 to-background p-4">
                        <div className="flex items-start gap-3 rounded-2xl border bg-background/80 p-4">
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                            <div>
                                <p className="text-sm font-medium">Fonte oficial</p>
                                <p className="text-sm text-muted-foreground">Consulta integrada com Receita Federal via HubDo.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-2xl border bg-background/80 p-4">
                            <Clock3 className="mt-0.5 h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-sm font-medium">Modo normal ou turbo</p>
                                <p className="text-sm text-muted-foreground">Escolha entre menor custo ou menor tempo de resposta.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-2xl border bg-background/80 p-4">
                            <FileBadge2 className="mt-0.5 h-5 w-5 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium">Histórico centralizado</p>
                                <p className="text-sm text-muted-foreground">Recupere consultas anteriores e refaça buscas em um clique.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="space-y-4">
                <HubdoCpfLookupClient />
            </div>
        </main>
    );
}
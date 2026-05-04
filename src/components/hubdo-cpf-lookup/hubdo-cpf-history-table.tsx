'use client';

import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useEffect, useEffectEvent, useMemo, useState } from 'react';
import {
    HubdoCpfHistoryApiError,
    HubdoCpfHistoryItem,
    PaginatedHubdoCpfHistory,
} from './types';

interface HubdoCpfHistoryTableProps {
    page: number;
    onPageChange: (page: number) => void;
    onSelectCpf: (cpf: string) => void;
    refreshKey: number;
}

function formatOrigin(origin: string): string {
    if (origin === 'database') return 'Banco';
    if (origin === 'turbo') return 'Turbo';
    return 'Receita';
}

export function HubdoCpfHistoryTable({
    page,
    onPageChange,
    onSelectCpf,
    refreshKey,
}: HubdoCpfHistoryTableProps) {
    const [history, setHistory] = useState<PaginatedHubdoCpfHistory | null>(null);
    const [filterCpf, setFilterCpf] = useState('');
    const [appliedFilterCpf, setAppliedFilterCpf] = useState('');
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadHistory = useEffectEvent(async (nextPage: number, cpfFilter: string): Promise<void> => {
        setIsLoadingHistory(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            params.set('page', String(nextPage));
            params.set('pageSize', '10');

            if (cpfFilter.trim()) {
                params.set('cpf', cpfFilter.trim());
            }

            const response = await fetch(`/api/hubdo-cpf-lookups-history?${params.toString()}`, {
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const payload = (await response.json()) as HubdoCpfHistoryApiError;
                throw new Error(payload.error || 'Failed to load history.');
            }

            const data = (await response.json()) as PaginatedHubdoCpfHistory;
            setHistory(data);
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : 'Unknown error.');
        } finally {
            setIsLoadingHistory(false);
        }
    });

    useEffect(() => {
        queueMicrotask(() => {
            void loadHistory(page, appliedFilterCpf);
        });
    }, [page, appliedFilterCpf, refreshKey]);

    function handleApplyFilter(): void {
        setExpandedItemId(null);

        if (page !== 1) {
            onPageChange(1);
        }

        setAppliedFilterCpf(filterCpf.trim());
    }

    const rows = useMemo(() => history?.items ?? [], [history]);

    if (error) {
        return <FriendlyMessage description={error} title="Erro ao Carregar Histórico" variant="error" />;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    className="h-11 rounded-2xl"
                    disabled={isLoadingHistory}
                    onChange={(event) => setFilterCpf(event.target.value)}
                    placeholder="Filtrar por CPF..."
                    type="text"
                    value={filterCpf}
                />
                <Button className="h-11 rounded-2xl px-6" disabled={isLoadingHistory} onClick={handleApplyFilter}>
                    <Search className="h-4 w-4" />
                </Button>
            </div>

            {isLoadingHistory && !history ? (
                <FriendlyMessage description="Carregando histórico..." title="Carregando" variant="info" />
            ) : null}

            {history && rows.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left font-medium">CPF</th>
                                <th className="p-3 text-left font-medium">Status</th>
                                <th className="p-3 text-left font-medium">Situação</th>
                                <th className="p-3 text-left font-medium">Modo</th>
                                <th className="p-3 text-center font-medium">Créditos</th>
                                <th className="p-3 text-left font-medium">Data</th>
                                <th className="p-3 text-center font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((item) => {
                                const isExpanded = expandedItemId === item.id;

                                return (
                                    <>
                                        <tr className="border-t hover:bg-muted/50" key={item.id}>
                                            <td className="p-3">{item.cpf}</td>
                                            <td className="p-3">
                                                <span className={item.requestStatus === 'OK' ? 'text-green-600' : 'text-red-600'}>
                                                    {item.requestStatus}
                                                </span>
                                            </td>
                                            <td className="p-3">{item.responseCadastralStatus || '-'}</td>
                                            <td className="p-3">{item.queryMode} / {formatOrigin(item.origem)}</td>
                                            <td className="p-3 text-center">{item.creditosConsumidos}</td>
                                            <td className="p-3 text-xs">{new Date(item.createdAt).toLocaleString('pt-BR')}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                                                        size="sm"
                                                        type="button"
                                                        variant="ghost"
                                                    >
                                                        {isExpanded ? 'Ocultar' : 'Detalhes'}
                                                    </Button>
                                                    <Button
                                                        onClick={() => onSelectCpf(item.cpf)}
                                                        size="sm"
                                                        type="button"
                                                        variant="ghost"
                                                    >
                                                        Re-buscar
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {isExpanded ? (
                                            <tr className="border-t bg-muted/20" key={`${item.id}-details`}>
                                                <td className="p-4" colSpan={7}>
                                                    <HistoryDetails item={item} />
                                                </td>
                                            </tr>
                                        ) : null}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : null}

            {history && rows.length === 0 && !isLoadingHistory ? (
                <FriendlyMessage
                    description="Nenhuma consulta realizada ainda."
                    title="Sem Histórico"
                    variant="info"
                />
            ) : null}

            {history && history.totalPages > 1 ? (
                <div className="flex items-center justify-end gap-2">
                    <Button
                        className="rounded-2xl"
                        disabled={page <= 1 || isLoadingHistory}
                        onClick={() => onPageChange(page - 1)}
                        type="button"
                        variant="outline"
                    >
                        Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Página {page} de {history.totalPages}
                    </span>
                    <Button
                        className="rounded-2xl"
                        disabled={page >= history.totalPages || isLoadingHistory}
                        onClick={() => onPageChange(page + 1)}
                        type="button"
                        variant="outline"
                    >
                        Próxima
                    </Button>
                </div>
            ) : null}
        </div>
    );
}

function HistoryDetails({ item }: { item: HubdoCpfHistoryItem }) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            <div>
                <p className="text-xs text-muted-foreground">Nome</p>
                <p className="font-medium">{item.responseName || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">{item.responseBirthDate || item.birthDate || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Data de Inscrição</p>
                <p className="font-medium">{item.responseInscriptionDate || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Dígito Verificador</p>
                <p className="font-medium">{item.responseCheckDigit || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Comprovante</p>
                <p className="font-medium">{item.responseProof || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Erro</p>
                <p className="font-medium">{item.errorMessage || item.errorCode || '-'}</p>
            </div>
        </div>
    );
}
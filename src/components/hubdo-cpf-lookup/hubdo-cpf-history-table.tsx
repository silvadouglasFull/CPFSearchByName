'use client';

import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Badge } from '@/components/ui/badge';
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
    if (origin === 'database') return 'Database';
    if (origin === 'turbo') return 'Turbo';
    return 'Revenue';
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
        return <FriendlyMessage description={error} title="Unable to load history" variant="error" />;
    }

    return (
        <div className="space-y-4">
            <div className="rounded-3xl border bg-card p-4 shadow-sm md:p-5">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-lg font-semibold">Lookup history</h2>
                        <p className="text-sm text-muted-foreground">
                            Filter by CPF, review details from previous responses, and rerun searches without filling the form again.
                        </p>
                    </div>
                    {history ? (
                        <Badge className="rounded-full self-start" variant="secondary">
                            {history.totalItems} records
                        </Badge>
                    ) : null}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        className="h-11 rounded-2xl"
                        disabled={isLoadingHistory}
                        onChange={(event) => setFilterCpf(event.target.value)}
                        placeholder="Filter by CPF..."
                        type="text"
                        value={filterCpf}
                    />
                    <Button className="h-11 rounded-2xl px-6" disabled={isLoadingHistory} onClick={handleApplyFilter}>
                        <Search className="mr-2 h-4 w-4" />
                        Apply filter
                    </Button>
                </div>
            </div>

            {isLoadingHistory && !history ? (
                <FriendlyMessage description="Loading lookup history..." title="Loading" variant="info" />
            ) : null}

            {history && rows.length > 0 ? (
                <div className="overflow-x-auto rounded-3xl border bg-card p-2 shadow-sm md:p-4">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left font-medium">CPF</th>
                                <th className="p-3 text-left font-medium">Status</th>
                                <th className="p-3 text-left font-medium">Situation</th>
                                <th className="p-3 text-left font-medium">Mode</th>
                                <th className="p-3 text-center font-medium">Credits</th>
                                <th className="p-3 text-left font-medium">Date</th>
                                <th className="p-3 text-center font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((item) => {
                                const isExpanded = expandedItemId === item.id;

                                return (
                                    <>
                                        <tr className="border-t hover:bg-muted/40" key={item.id}>
                                            <td className="p-3">{item.cpf}</td>
                                            <td className="p-3">
                                                <Badge variant="outline">
                                                    {item.requestStatus === 'OK' ? 'Completed' : 'Failed'}
                                                </Badge>
                                            </td>
                                            <td className="p-3">{item.responseCadastralStatus || '-'}</td>
                                            <td className="p-3">{item.queryMode === 'turbo' ? 'Turbo' : 'Normal'} / {formatOrigin(item.origem)}</td>
                                            <td className="p-3 text-center">{item.creditosConsumidos}</td>
                                            <td className="p-3 text-xs">{new Date(item.createdAt).toLocaleString('en-US')}</td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                                                        size="sm"
                                                        type="button"
                                                        variant="ghost"
                                                    >
                                                        {isExpanded ? 'Hide' : 'Details'}
                                                    </Button>
                                                    <Button
                                                        onClick={() => onSelectCpf(item.cpf)}
                                                        size="sm"
                                                        type="button"
                                                        variant="ghost"
                                                    >
                                                        Search again
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
                    description="No lookups have been recorded yet for the current filters."
                    title="Empty history"
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
                        Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {history.totalPages}
                    </span>
                    <Button
                        className="rounded-2xl"
                        disabled={page >= history.totalPages || isLoadingHistory}
                        onClick={() => onPageChange(page + 1)}
                        type="button"
                        variant="outline"
                    >
                        Next
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
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{item.responseName || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Birth date</p>
                <p className="font-medium">{item.responseBirthDate || item.birthDate || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Registration date</p>
                <p className="font-medium">{item.responseInscriptionDate || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Check digit</p>
                <p className="font-medium">{item.responseCheckDigit || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Proof code</p>
                <p className="font-medium">{item.responseProof || '-'}</p>
            </div>
            <div>
                <p className="text-xs text-muted-foreground">Error</p>
                <p className="font-medium">{item.errorMessage || item.errorCode || '-'}</p>
            </div>
        </div>
    );
}
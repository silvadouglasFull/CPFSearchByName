'use client';

import { FilterCpfHistoryTable } from '@/components/filter-by-cpf/filter-cpf-history-table';
import { FilterCpfResultsTable } from '@/components/filter-by-cpf/filter-cpf-results-table';
import {
    FilterByCpfApiError,
    FilterByCpfApiResponse,
    PaginatedFilterCpfHistory,
    PortalResultRecord,
} from '@/components/filter-by-cpf/types';
import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save, Search } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const PARTIAL_CPF_PLACEHOLDER = '009108';
const HISTORY_PAGE_SIZE = 10;

type FilterCpfTab = 'search' | 'history';

export function FilterCpfClient() {
    const [activeTab, setActiveTab] = useState<FilterCpfTab>('search');
    const [partialCpf, setPartialCpf] = useState('');
    const [records, setRecords] = useState<PortalResultRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [historyMessage, setHistoryMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [history, setHistory] = useState<PaginatedFilterCpfHistory | null>(null);

    const canSearch = useMemo(() => partialCpf.trim().length > 0, [partialCpf]);
    const canSave = useMemo(() => partialCpf.trim().length > 0 && records.length > 0, [partialCpf, records]);

    async function handleSearch(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!canSearch) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        setHasSearched(true);

        try {
            const response = await fetch(`/api/filter-by-cpf?partialCpf=${encodeURIComponent(partialCpf.trim())}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as FilterByCpfApiError;
                throw new Error(errorPayload.error || 'Failed to fetch filtered records.');
            }

            const payload = (await response.json()) as FilterByCpfApiResponse;
            setRecords(payload.records);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setRecords([]);
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function loadHistory(page: number): Promise<void> {
        setIsHistoryLoading(true);
        setHistoryMessage(null);

        try {
            const response = await fetch(`/api/filter-by-cpf-history?page=${page}&pageSize=${HISTORY_PAGE_SIZE}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as FilterByCpfApiError;
                throw new Error(errorPayload.error || 'Failed to load history.');
            }

            const payload = (await response.json()) as PaginatedFilterCpfHistory;
            setHistory(payload);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setHistoryMessage(message);
        } finally {
            setIsHistoryLoading(false);
        }
    }

    async function handleSaveResults(): Promise<void> {
        if (!canSave || isSaving) {
            return;
        }

        setIsSaving(true);
        setHistoryMessage(null);

        try {
            const response = await fetch('/api/filter-by-cpf-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    partialCpf: partialCpf.trim(),
                    records,
                }),
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as FilterByCpfApiError;
                throw new Error(errorPayload.error || 'Failed to save results.');
            }

            setHistoryMessage('Results saved to history.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setHistoryMessage(message);
        } finally {
            setIsSaving(false);
        }
    }

    function openSearchTab(): void {
        setActiveTab('search');
    }

    function openHistoryTab(): void {
        setActiveTab('history');

        if (!history) {
            void loadHistory(1);
        }
    }

    return (
        <section className="space-y-6">
            <div className="flex gap-2">
                <Button
                    className="rounded-2xl"
                    onClick={openSearchTab}
                    type="button"
                    variant={activeTab === 'search' ? 'default' : 'outline'}
                >
                    Search
                </Button>
                <Button
                    className="rounded-2xl"
                    onClick={openHistoryTab}
                    type="button"
                    variant={activeTab === 'history' ? 'default' : 'outline'}
                >
                    History
                </Button>
            </div>

            {activeTab === 'search' ? (
                <>
            <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                    <CardTitle>Find by Partial CPF</CardTitle>
                    <CardDescription>
                        Enter any CPF segment from 1 to 9 digits to search matching records.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleSearch}>
                        <Input
                            className="h-11 rounded-2xl"
                            onChange={(event) => setPartialCpf(event.target.value)}
                            placeholder={PARTIAL_CPF_PLACEHOLDER}
                            value={partialCpf}
                        />
                        <Button
                            className="h-11 rounded-2xl px-6"
                            disabled={!canSearch || isLoading}
                            type="submit"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                    </form>

                    <div className="mt-3 flex justify-end">
                        <Button
                            className="h-11 rounded-2xl px-6"
                            disabled={!canSave || isSaving}
                            onClick={() => {
                                void handleSaveResults();
                            }}
                            type="button"
                            variant="secondary"
                        >
                            <Save className="mr-2 h-4 w-4" />
                            {isSaving ? 'Saving...' : 'Salvar Resultados'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {errorMessage ? (
                <FriendlyMessage
                    description={errorMessage}
                    title="Request failed"
                    variant="error"
                />
            ) : null}

            {hasSearched && !isLoading && records.length === 0 && !errorMessage ? (
                <FriendlyMessage
                    description="No CPF records matched this partial value in resultados_portal.json."
                    title="No matching records"
                    variant="info"
                />
            ) : null}

            {records.length > 0 ? <FilterCpfResultsTable records={records} /> : null}
                </>
            ) : null}

            {activeTab === 'history' ? (
                <>
                    {isHistoryLoading ? (
                        <FriendlyMessage
                            description="Loading saved searches."
                            title="Loading history"
                            variant="info"
                        />
                    ) : null}

                    {historyMessage ? (
                        <FriendlyMessage
                            description={historyMessage}
                            title={historyMessage === 'Results saved to history.' ? 'Success' : 'History error'}
                            variant={historyMessage === 'Results saved to history.' ? 'success' : 'error'}
                        />
                    ) : null}

                    {history && history.items.length > 0 ? (
                        <>
                            <FilterCpfHistoryTable items={history.items} />

                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    className="rounded-2xl"
                                    disabled={history.page <= 1 || isHistoryLoading}
                                    onClick={() => {
                                        void loadHistory(history.page - 1);
                                    }}
                                    type="button"
                                    variant="outline"
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    Page {history.page} of {history.totalPages}
                                </span>
                                <Button
                                    className="rounded-2xl"
                                    disabled={history.page >= history.totalPages || isHistoryLoading}
                                    onClick={() => {
                                        void loadHistory(history.page + 1);
                                    }}
                                    type="button"
                                    variant="outline"
                                >
                                    Next
                                </Button>
                            </div>
                        </>
                    ) : null}

                    {history && history.items.length === 0 && !isHistoryLoading ? (
                        <FriendlyMessage
                            description="No saved CPF searches yet."
                            title="Empty history"
                            variant="info"
                        />
                    ) : null}
                </>
            ) : null}
        </section>
    );
}

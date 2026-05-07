'use client';

import { GetCpfsByNameHistoryTable } from '@/components/get-cpfs-by-name/get-cpfs-by-name-history-table';
import { GetCpfsByNameProgress } from '@/components/get-cpfs-by-name/get-cpfs-by-name-progress';
import { GetCpfsByNameResultsTable } from '@/components/get-cpfs-by-name/get-cpfs-by-name-results-table';
import { CollectionEvent, GetCpfsByNameHistoryRecord, PageStatus, PaginatedGetCpfsByNameHistory, PortalRecord } from '@/components/get-cpfs-by-name/types';
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

const SEARCH_NAME_PLACEHOLDER = 'Maria Silva';
const TOTAL_PORTAL_PAGES = 6;
const HISTORY_PAGE_SIZE = 10;

type GetCpfsByNameTab = 'search' | 'history';

export function GetCpfsByNameClient() {
    const [activeTab, setActiveTab] = useState<GetCpfsByNameTab>('search');
    const [searchName, setSearchName] = useState('');
    const [records, setRecords] = useState<PortalRecord[]>([]);
    const [pageStatuses, setPageStatuses] = useState<PageStatus[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [historyErrorMessage, setHistoryErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isHistoryDetailsLoading, setIsHistoryDetailsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [totalRecords, setTotalRecords] = useState<number | null>(null);
    const [history, setHistory] = useState<PaginatedGetCpfsByNameHistory | null>(null);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<GetCpfsByNameHistoryRecord | null>(null);
    const [selectedHistoryItemId, setSelectedHistoryItemId] = useState<string | null>(null);

    const canSearch = useMemo(() => searchName.trim().length > 0, [searchName]);
    const canSave = useMemo(() => searchName.trim().length > 0 && records.length > 0, [searchName, records]);

    const showProgress = hasSearched && pageStatuses.length > 0;

    async function handleSearch(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!canSearch) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        setHasSearched(true);
        setRecords([]);
        setPageStatuses([]);
        setTotalRecords(null);

        try {
            const response = await fetch(`/api/get-cpfs-by-name?searchName=${encodeURIComponent(searchName.trim())}`, {
                method: 'GET',
                headers: { Accept: 'text/event-stream' },
            });

            if (!response.body) {
                throw new Error('No response stream received.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() ?? '';

                for (const line of lines) {
                    if (!line.startsWith('data: ')) {
                        continue;
                    }

                    const raw = line.slice(6).trim();

                    if (!raw) {
                        continue;
                    }

                    const event = JSON.parse(raw) as CollectionEvent;

                    if (event.type === 'progress') {
                        setPageStatuses((previous) => {
                            const next = [...previous];

                            while (next.length < event.totalPages) {
                                next.push({ state: 'idle' });
                            }

                            next[event.currentPage - 1] = { state: 'collecting' };
                            return next;
                        });
                    } else if (event.type === 'page') {
                        setRecords((previous) => [...previous, ...event.records]);
                        setPageStatuses((previous) => {
                            const next = [...previous];
                            next[event.currentPage - 1] = { state: 'done', count: event.records.length };
                            return next;
                        });
                    } else if (event.type === 'page_error') {
                        setPageStatuses((previous) => {
                            const next = [...previous];
                            next[event.currentPage - 1] = { state: 'error', message: event.message };
                            return next;
                        });
                    } else if (event.type === 'done') {
                        setTotalRecords(event.totalRecords);
                    } else if (event.type === 'error') {
                        setErrorMessage(event.message);
                    }
                }
            }
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
        setHistoryErrorMessage(null);
        setSelectedHistoryItem(null);
        setSelectedHistoryItemId(null);

        try {
            const response = await fetch(`/api/get-cpfs-by-name-history?page=${page}&pageSize=${HISTORY_PAGE_SIZE}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as { error: string };
                throw new Error(errorPayload.error || 'Failed to load history.');
            }

            const payload = (await response.json()) as PaginatedGetCpfsByNameHistory;
            setHistory(payload);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setHistoryErrorMessage(message);
        } finally {
            setIsHistoryLoading(false);
        }
    }

    async function handleSaveResults(): Promise<void> {
        if (!canSave || isSaving) {
            return;
        }

        setIsSaving(true);
        setSaveMessage(null);

        try {
            const response = await fetch('/api/get-cpfs-by-name-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    searchName: searchName.trim(),
                    records,
                }),
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as { error: string };
                throw new Error(errorPayload.error || 'Failed to save results.');
            }

            setSaveMessage('Results saved to history.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setSaveMessage(message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleViewHistoryRecords(itemId: string): Promise<void> {
        setIsHistoryDetailsLoading(true);
        setSelectedHistoryItemId(itemId);
        setHistoryErrorMessage(null);

        try {
            const response = await fetch(`/api/get-cpfs-by-name-history/${itemId}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as { error: string };
                throw new Error(errorPayload.error || 'Failed to load snapshot records.');
            }

            const payload = (await response.json()) as { item: GetCpfsByNameHistoryRecord };
            setSelectedHistoryItem(payload.item);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setHistoryErrorMessage(message);
        } finally {
            setIsHistoryDetailsLoading(false);
            setSelectedHistoryItemId(null);
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
                            <CardTitle>Collect by Person Name</CardTitle>
                            <CardDescription>
                                Enter a person name to collect CPF records across configured portal pages.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={handleSearch}>
                                <Input
                                    className="h-11 rounded-2xl"
                                    onChange={(event) => setSearchName(event.target.value)}
                                    placeholder={SEARCH_NAME_PLACEHOLDER}
                                    value={searchName}
                                />
                                <Button className="h-11 rounded-2xl px-6" disabled={!canSearch || isLoading} type="submit">
                                    <Search className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Collecting...' : 'Collect'}
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
                                    {isSaving ? 'Saving...' : 'Save Results'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {showProgress ? (
                        <GetCpfsByNameProgress
                            pageStatuses={pageStatuses}
                            totalPages={TOTAL_PORTAL_PAGES}
                        />
                    ) : null}

                    {errorMessage ? (
                        <FriendlyMessage
                            description={errorMessage}
                            title="Request failed"
                            variant="error"
                        />
                    ) : null}

                    {saveMessage ? (
                        <FriendlyMessage
                            description={saveMessage}
                            title={saveMessage === 'Results saved to history.' ? 'Success' : 'Save error'}
                            variant={saveMessage === 'Results saved to history.' ? 'success' : 'error'}
                        />
                    ) : null}

                    {totalRecords !== null && records.length === 0 && !errorMessage ? (
                        <FriendlyMessage
                            description="No records were collected for this name across the configured pages."
                            title="No records found"
                            variant="info"
                        />
                    ) : null}

                    {records.length > 0 ? <GetCpfsByNameResultsTable records={records} /> : null}
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

                    {historyErrorMessage ? (
                        <FriendlyMessage
                            description={historyErrorMessage}
                            title="History error"
                            variant="error"
                        />
                    ) : null}

                    {history && history.items.length > 0 ? (
                        <>
                            <GetCpfsByNameHistoryTable
                                isViewingItemId={selectedHistoryItemId}
                                items={history.items}
                                onViewRecords={(itemId) => {
                                    void handleViewHistoryRecords(itemId);
                                }}
                            />

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

                            {isHistoryDetailsLoading ? (
                                <FriendlyMessage
                                    description="Loading persisted records for the selected search."
                                    title="Loading details"
                                    variant="info"
                                />
                            ) : null}

                            {selectedHistoryItem ? (
                                <>
                                    <Card className="rounded-3xl shadow-sm">
                                        <CardHeader>
                                            <CardTitle>Search Details</CardTitle>
                                            <CardDescription>
                                                Search name: {selectedHistoryItem.searchName} | Saved results:{' '}
                                                {selectedHistoryItem.resultCount}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>

                                    {selectedHistoryItem.records.length > 0 ? (
                                        <GetCpfsByNameResultsTable records={selectedHistoryItem.records} />
                                    ) : (
                                        <FriendlyMessage
                                            description="This search has no persisted records."
                                            title="No records in snapshot"
                                            variant="info"
                                        />
                                    )}
                                </>
                            ) : null}
                        </>
                    ) : null}

                    {history && history.items.length === 0 && !isHistoryLoading ? (
                        <FriendlyMessage
                            description="No saved searches yet."
                            title="Empty history"
                            variant="info"
                        />
                    ) : null}
                </>
            ) : null}
        </section>
    );
}


'use client';

import { GeneratorCpfHistoryTable } from '@/components/generator-cpf/generator-cpf-history-table';
import { GeneratorCpfResultsTable } from '@/components/generator-cpf/generator-cpf-results-table';
import { GeneratorCpfSearchModal } from '@/components/generator-cpf/generator-cpf-search-modal';
import {
    BulkHubdoLookupResponse,
    GeneratedCpfRecord,
    GeneratorCpfApiError,
    GeneratorCpfApiResponse,
    GeneratorCpfHistoryRecord,
    PaginatedGeneratorCpfHistory,
} from '@/components/generator-cpf/types';
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
import identifyByState from '@/identifyByState.json';
import { Save, Search, WandSparkles } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const PARTIAL_CPF_PLACEHOLDER = '09108';
const HISTORY_PAGE_SIZE = 10;
const STATE_BY_REGION_DIGIT = identifyByState as Record<string, string[]>;
const REGION_OPTIONS = Object.entries(STATE_BY_REGION_DIGIT)
    .sort(([digitA], [digitB]) => Number(digitA) - Number(digitB))
    .map(([digit, states]) => ({
        value: digit,
        label: `${states.join(', ')} (digit ${digit})`,
    }));

type GeneratorCpfTab = 'search' | 'history';

export function GeneratorCpfClient() {
    const [activeTab, setActiveTab] = useState<GeneratorCpfTab>('search');
    const [partialCpf, setPartialCpf] = useState('');
    const [regionDigit, setRegionDigit] = useState('');
    const [records, setRecords] = useState<GeneratedCpfRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [historyErrorMessage, setHistoryErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isHistoryDetailsLoading, setIsHistoryDetailsLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);
    const [history, setHistory] = useState<PaginatedGeneratorCpfHistory | null>(null);
    const [selectedHistoryItem, setSelectedHistoryItem] = useState<GeneratorCpfHistoryRecord | null>(null);
    const [selectedHistoryItemId, setSelectedHistoryItemId] = useState<string | null>(null);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [selectionEnabled, setSelectionEnabled] = useState(false);
    const [selectedCpfs, setSelectedCpfs] = useState<string[]>([]);
    const [isBulkLookupLoading, setIsBulkLookupLoading] = useState(false);
    const [bulkLookupResult, setBulkLookupResult] = useState<BulkHubdoLookupResponse | null>(null);
    const [bulkLookupErrorMessage, setBulkLookupErrorMessage] = useState<string | null>(null);

    const canGenerate = useMemo(() => partialCpf.trim().length > 0, [partialCpf]);
    const canSave = useMemo(() => partialCpf.trim().length > 0 && records.length > 0, [partialCpf, records]);
    const canBulkLookup = useMemo(() => selectedCpfs.length > 0, [selectedCpfs]);

    async function handleGenerate(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!canGenerate) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        setHasGenerated(true);

        try {
            const query = new URLSearchParams({ partialCpf: partialCpf.trim() });

            if (regionDigit.trim()) {
                query.set('regionDigit', regionDigit.trim());
            }

            const response = await fetch(`/api/generator-cpf?${query.toString()}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as GeneratorCpfApiError;
                throw new Error(errorPayload.error || 'Failed to generate CPF candidates.');
            }

            const payload = (await response.json()) as GeneratorCpfApiResponse;
            setRecords(payload.records);
            setSelectionEnabled(false);
            setSelectedCpfs([]);
            setBulkLookupResult(null);
            setBulkLookupErrorMessage(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setRecords([]);
            setErrorMessage(message);
            setSelectionEnabled(false);
            setSelectedCpfs([]);
            setBulkLookupResult(null);
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
            const response = await fetch(`/api/generator-cpf-history?page=${page}&pageSize=${HISTORY_PAGE_SIZE}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as GeneratorCpfApiError;
                throw new Error(errorPayload.error || 'Failed to load history.');
            }

            const payload = (await response.json()) as PaginatedGeneratorCpfHistory;
            setHistory(payload);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setHistoryErrorMessage(message);
        } finally {
            setIsHistoryLoading(false);
        }
    }

    async function handleViewHistoryRecords(itemId: string): Promise<void> {
        setIsHistoryDetailsLoading(true);
        setSelectedHistoryItemId(itemId);
        setHistoryErrorMessage(null);

        try {
            const response = await fetch(`/api/generator-cpf-history/${itemId}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as GeneratorCpfApiError;
                throw new Error(errorPayload.error || 'Failed to load snapshot records.');
            }

            const payload = (await response.json()) as { item: GeneratorCpfHistoryRecord };
            setSelectedHistoryItem(payload.item);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setHistoryErrorMessage(message);
        } finally {
            setIsHistoryDetailsLoading(false);
            setSelectedHistoryItemId(null);
        }
    }

    async function handleSaveResults(): Promise<void> {
        if (!canSave || isSaving) {
            return;
        }

        setIsSaving(true);
        setSaveMessage(null);

        try {
            const response = await fetch('/api/generator-cpf-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    partialCpf: partialCpf.trim(),
                    stateRegionDigit: regionDigit.trim() ? regionDigit.trim() : null,
                    records,
                }),
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as GeneratorCpfApiError;
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

    function openSearchTab(): void {
        setActiveTab('search');
    }

    function openHistoryTab(): void {
        setActiveTab('history');

        if (!history) {
            void loadHistory(1);
        }
    }

    function handleSelectCpfFromModal(baseNineDigits: string): void {
        setPartialCpf(baseNineDigits);
        setIsSearchModalOpen(false);
    }

    function toggleSelectionMode(): void {
        setSelectionEnabled((current) => {
            if (current) {
                setSelectedCpfs([]);
            }

            return !current;
        });
    }

    function toggleCpfSelection(cpf: string): void {
        setSelectedCpfs((current) =>
            current.includes(cpf)
                ? current.filter((value) => value !== cpf)
                : [...current, cpf],
        );
    }

    async function handleBulkLookup(): Promise<void> {
        if (!canBulkLookup || isBulkLookupLoading) {
            return;
        }

        setIsBulkLookupLoading(true);
        setBulkLookupErrorMessage(null);
        setBulkLookupResult(null);

        try {
            const response = await fetch('/api/hubdo-cpf-lookup/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ cpfs: selectedCpfs, mode: 'normal' }),
            });

            const payload = (await response.json()) as BulkHubdoLookupResponse | GeneratorCpfApiError;

            if (!response.ok) {
                throw new Error((payload as GeneratorCpfApiError).error || 'Bulk HubDo lookup failed.');
            }

            setBulkLookupResult(payload as BulkHubdoLookupResponse);
        } catch (error) {
            setBulkLookupErrorMessage(error instanceof Error ? error.message : 'Unknown error.');
        } finally {
            setIsBulkLookupLoading(false);
        }
    }

    return (
        <>
            <GeneratorCpfSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSelectCpf={handleSelectCpfFromModal}
            />
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
                            <CardTitle>Generate CPF Candidates</CardTitle>
                            <CardDescription>
                                Provide a partial CPF from 1 to 9 digits and, optionally, choose a state to apply its
                                CPF region digit.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="grid gap-3 md:grid-cols-[1fr_220px_auto_auto]" onSubmit={handleGenerate}>
                                <Input
                                    className="h-11 rounded-2xl"
                                    onChange={(event) => setPartialCpf(event.target.value)}
                                    placeholder={PARTIAL_CPF_PLACEHOLDER}
                                    value={partialCpf}
                                />
                                <select
                                    aria-label="State filter"
                                    className="h-11 rounded-2xl border bg-background px-3 text-sm outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring/60"
                                    onChange={(event) => setRegionDigit(event.target.value)}
                                    value={regionDigit}
                                >
                                    <option value="">All states (no region filter)</option>
                                    {REGION_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    className="h-11 rounded-2xl px-4"
                                    onClick={() => setIsSearchModalOpen(true)}
                                    type="button"
                                    variant="outline"
                                    title="Search partial CPF from history"
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                                <Button
                                    className="h-11 rounded-2xl px-6"
                                    disabled={!canGenerate || isLoading}
                                    type="submit"
                                >
                                    <WandSparkles className="mr-2 h-4 w-4" />
                                    {isLoading ? 'Generating...' : 'Generate'}
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

                    {errorMessage ? <FriendlyMessage description={errorMessage} title="Request failed" variant="error" /> : null}

                    {saveMessage ? (
                        <FriendlyMessage
                            description={saveMessage}
                            title={saveMessage === 'Results saved to history.' ? 'Success' : 'Save error'}
                            variant={saveMessage === 'Results saved to history.' ? 'success' : 'error'}
                        />
                    ) : null}

                    {hasGenerated && !isLoading && records.length === 0 && !errorMessage ? (
                        <FriendlyMessage
                            description="No valid CPF candidates were generated for the informed values."
                            title="No candidates found"
                            variant="info"
                        />
                    ) : null}

                    {records.length > 0 ? (
                        <>
                            <GeneratorCpfResultsTable
                                onToggleCpfSelection={toggleCpfSelection}
                                onToggleSelectionMode={toggleSelectionMode}
                                records={records}
                                selectedCpfs={selectedCpfs}
                                selectionEnabled={selectionEnabled}
                            />

                            {selectionEnabled ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-muted-foreground">
                                            {selectedCpfs.length} CPF(s) selected for HubDo lookup.
                                        </p>
                                        <Button
                                            className="rounded-2xl"
                                            disabled={!canBulkLookup || isBulkLookupLoading}
                                            onClick={() => {
                                                void handleBulkLookup();
                                            }}
                                            type="button"
                                        >
                                            {isBulkLookupLoading ? 'Querying HubDo...' : 'Lookup selected CPFs'}
                                        </Button>
                                    </div>

                                    {bulkLookupErrorMessage ? (
                                        <FriendlyMessage
                                            description={bulkLookupErrorMessage}
                                            title="Bulk lookup failed"
                                            variant="error"
                                        />
                                    ) : null}

                                    {bulkLookupResult ? (
                                        <FriendlyMessage
                                            description={`${bulkLookupResult.summary.success} success, ${bulkLookupResult.summary.error} error(s), ${bulkLookupResult.summary.total} processed.`}
                                            title="Bulk lookup completed"
                                            variant={bulkLookupResult.summary.error > 0 ? 'warning' : 'success'}
                                        />
                                    ) : null}
                                </div>
                            ) : null}
                        </>
                    ) : null}
                </>
            ) : null}

            {activeTab === 'history' ? (
                <>
                    {isHistoryLoading ? (
                        <FriendlyMessage
                            description="Loading saved generations."
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
                            <GeneratorCpfHistoryTable
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
                                    description="Loading persisted CPF records for the selected snapshot."
                                    title="Loading details"
                                    variant="info"
                                />
                            ) : null}

                            {selectedHistoryItem ? (
                                <>
                                    <Card className="rounded-3xl shadow-sm">
                                        <CardHeader>
                                            <CardTitle>Snapshot Details</CardTitle>
                                            <CardDescription>
                                                Partial CPF: {selectedHistoryItem.partialCpf} | Region digit:{' '}
                                                {selectedHistoryItem.stateRegionDigit ?? 'All states'} | Saved results:{' '}
                                                {selectedHistoryItem.resultCount}
                                            </CardDescription>
                                        </CardHeader>
                                    </Card>

                                    {selectedHistoryItem.resultRecords.length > 0 ? (
                                        <GeneratorCpfResultsTable records={selectedHistoryItem.resultRecords} />
                                    ) : (
                                        <FriendlyMessage
                                            description="This snapshot has no persisted CPF records."
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
                            description="No saved CPF generations yet."
                            title="Empty history"
                            variant="info"
                        />
                    ) : null}
                </>
            ) : null}
            </section>
        </>
    );
}

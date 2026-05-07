'use client';

import { GeneratorCpfHistoryTable } from '@/components/generator-cpf/generator-cpf-history-table';
import { GeneratorCpfResultsTable } from '@/components/generator-cpf/generator-cpf-results-table';
import { GeneratorCpfSearchModal } from '@/components/generator-cpf/generator-cpf-search-modal';
import {
    BulkHubdoLookupJobAcceptedResponse,
    BulkHubdoLookupJobStatusResponse,
    BulkHubdoLookupResponse,
    GeneratedCpfRecord,
    GeneratorCpfApiError,
    GeneratorCpfApiResponse,
    GeneratorCpfHistoryRecord,
    PaginatedGeneratorCpfHistory,
} from '@/components/generator-cpf/types';
import { useHuddoBulkSocket } from '@/components/generator-cpf/use-hubdo-bulk-socket';
import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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

interface RealtimeJobSummary {
    total: number;
    queued: number;
    processing: number;
    success: number;
    error: number;
    deadLetter: number;
}

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
    const [bulkLookupMode, setBulkLookupMode] = useState<'normal' | 'turbo'>('normal');
    const [historySelectionEnabled, setHistorySelectionEnabled] = useState(false);
    const [selectedHistoryCpfs, setSelectedHistoryCpfs] = useState<string[]>([]);
    const [historyBulkLookupMode, setHistoryBulkLookupMode] = useState<'normal' | 'turbo'>('normal');
    const [isHistoryBulkLookupLoading, setIsHistoryBulkLookupLoading] = useState(false);
    const [historyBulkLookupResult, setHistoryBulkLookupResult] = useState<BulkHubdoLookupResponse | null>(null);
    const [historyBulkLookupErrorMessage, setHistoryBulkLookupErrorMessage] = useState<string | null>(null);
    const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
    const [bulkConfirmSource, setBulkConfirmSource] = useState<'search' | 'history' | null>(null);
    const [bulkConfirmTargetName, setBulkConfirmTargetName] = useState('');

    // Realtime job tracking
    const [currentJobId, setCurrentJobId] = useState<string | null>(null);
    const [realtimeSummary, setRealtimeSummary] = useState<RealtimeJobSummary | null>(null);

    // Setup realtime socket for current job
    useHuddoBulkSocket(currentJobId, {
        onJobUpdated: (event) => {
            setRealtimeSummary(event.summary);
            // Update bulk lookup result with realtime data
            setBulkLookupResult((prev) =>
                prev
                    ? {
                        ...prev,
                        job: { ...prev.job, status: event.status as any },
                        summary: event.summary,
                    }
                    : null,
            );
        },
        onJobCompleted: (event) => {
            setRealtimeSummary({
                total: event.finalSummary.total,
                queued: 0,
                processing: 0,
                success: event.finalSummary.success,
                error: event.finalSummary.error,
                deadLetter: event.finalSummary.deadLetter,
            });
            setBulkLookupResult((prev) =>
                prev
                    ? {
                        ...prev,
                        job: { ...prev.job, status: 'completed' as any },
                        summary: {
                            total: event.finalSummary.total,
                            queued: 0,
                            processing: 0,
                            success: event.finalSummary.success,
                            error: event.finalSummary.error,
                            deadLetter: event.finalSummary.deadLetter,
                        },
                    }
                    : null,
            );
            setCurrentJobId(null);
        },
        onJobFailed: (event) => {
            setBulkLookupErrorMessage('Job processing failed. Please try again.');
            setCurrentJobId(null);
        },
        onError: (error) => {
            console.error('[Socket.io] Error:', error);
        },
    });

    const canGenerate = useMemo(() => partialCpf.trim().length > 0, [partialCpf]);
    const canSave = useMemo(() => partialCpf.trim().length > 0 && records.length > 0, [partialCpf, records]);
    const canBulkLookup = useMemo(() => selectedCpfs.length > 0, [selectedCpfs]);
    const canHistoryBulkLookup = useMemo(() => selectedHistoryCpfs.length > 0, [selectedHistoryCpfs]);

    async function pollBulkLookupJob(jobId: string): Promise<BulkHubdoLookupJobStatusResponse> {
        const maxPolls = 120;
        const delayMs = 1500;

        for (let index = 0; index < maxPolls; index += 1) {
            const response = await fetch(`/api/hubdo-cpf-lookup/bulk/${jobId}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            const payload = (await response.json()) as BulkHubdoLookupJobStatusResponse | GeneratorCpfApiError;

            if (!response.ok) {
                throw new Error((payload as GeneratorCpfApiError).error || 'Failed to poll bulk lookup status.');
            }

            const data = payload as BulkHubdoLookupJobStatusResponse;

            if (data.job.status === 'completed' || data.job.status === 'failed') {
                return data;
            }

            await new Promise((resolve) => {
                setTimeout(resolve, delayMs);
            });
        }

        throw new Error('Bulk lookup job is taking too long. Try refreshing status in a few moments.');
    }

    function resetHistorySelectionState(): void {
        setHistorySelectionEnabled(false);
        setSelectedHistoryCpfs([]);
        setHistoryBulkLookupMode('normal');
        setHistoryBulkLookupResult(null);
        setHistoryBulkLookupErrorMessage(null);
    }

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
            setBulkLookupMode('normal');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setRecords([]);
            setErrorMessage(message);
            setSelectionEnabled(false);
            setSelectedCpfs([]);
            setBulkLookupResult(null);
            setBulkLookupMode('normal');
        } finally {
            setIsLoading(false);
        }
    }

    async function loadHistory(page: number): Promise<void> {
        setIsHistoryLoading(true);
        setHistoryErrorMessage(null);
        setSelectedHistoryItem(null);
        setSelectedHistoryItemId(null);
        resetHistorySelectionState();

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
        resetHistorySelectionState();

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
                    stateRegionDigit: regionDigit.trim(),
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
        resetHistorySelectionState();
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

    function toggleAllCpfs(recordsToToggle: GeneratedCpfRecord[]): void {
        const allCpfs = recordsToToggle.map((record) => record.cpf);

        setSelectedCpfs((current) =>
            current.length === allCpfs.length && allCpfs.every((cpf) => current.includes(cpf))
                ? []
                : allCpfs,
        );
    }

    function selectNextTenCpfs(recordsToSelect: GeneratedCpfRecord[]): void {
        const nextBatch = recordsToSelect
            .map((record) => record.cpf)
            .filter((cpf) => !selectedCpfs.includes(cpf))
            .slice(0, 10);

        if (nextBatch.length === 0) {
            return;
        }

        setSelectedCpfs((current) => Array.from(new Set([...current, ...nextBatch])));
    }

    function toggleHistorySelectionMode(): void {
        setHistorySelectionEnabled((current) => {
            if (current) {
                setSelectedHistoryCpfs([]);
                setHistoryBulkLookupResult(null);
                setHistoryBulkLookupErrorMessage(null);
            }

            return !current;
        });
    }

    function toggleHistoryCpfSelection(cpf: string): void {
        setSelectedHistoryCpfs((current) =>
            current.includes(cpf)
                ? current.filter((value) => value !== cpf)
                : [...current, cpf],
        );
    }

    function toggleAllHistoryCpfs(recordsToToggle: GeneratedCpfRecord[]): void {
        const allCpfs = recordsToToggle.map((record) => record.cpf);

        setSelectedHistoryCpfs((current) =>
            current.length === allCpfs.length && allCpfs.every((cpf) => current.includes(cpf))
                ? []
                : allCpfs,
        );
    }

    function selectNextTenHistoryCpfs(recordsToSelect: GeneratedCpfRecord[]): void {
        const nextBatch = recordsToSelect
            .map((record) => record.cpf)
            .filter((cpf) => !selectedHistoryCpfs.includes(cpf))
            .slice(0, 10);

        if (nextBatch.length === 0) {
            return;
        }

        setSelectedHistoryCpfs((current) => Array.from(new Set([...current, ...nextBatch])));
    }

    function openBulkConfirm(source: 'search' | 'history'): void {
        setBulkConfirmSource(source);
        setBulkConfirmTargetName('');
        setIsBulkConfirmOpen(true);
    }

    function closeBulkConfirm(): void {
        if (isBulkLookupLoading || isHistoryBulkLookupLoading) {
            return;
        }

        setIsBulkConfirmOpen(false);
        setBulkConfirmSource(null);
    }

    async function handleBulkLookup(targetName: string): Promise<void> {
        if (!canBulkLookup || isBulkLookupLoading) {
            return;
        }

        setIsBulkLookupLoading(true);
        setBulkLookupErrorMessage(null);
        setBulkLookupResult(null);
        setCurrentJobId(null);

        try {
            const response = await fetch('/api/hubdo-cpf-lookup/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ cpfs: selectedCpfs, mode: bulkLookupMode, targetName }),
            });

            const payload = (await response.json()) as BulkHubdoLookupJobAcceptedResponse | GeneratorCpfApiError;

            if (!response.ok) {
                throw new Error((payload as GeneratorCpfApiError).error || 'Bulk HubDo lookup failed.');
            }

            const accepted = payload as BulkHubdoLookupJobAcceptedResponse;

            // Set job ID to subscribe to realtime updates
            setCurrentJobId(accepted.jobId);
            setRealtimeSummary(accepted.summary);

            // Set initial result while waiting for realtime updates
            setBulkLookupResult({
                job: {
                    id: accepted.jobId,
                    mode: bulkLookupMode,
                    status: 'queued',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    finishedAt: null,
                },
                summary: accepted.summary,
                items: [],
                page: 1,
                pageSize: 50,
                totalItems: 0,
                totalPages: 1,
            });

            // Keep polling as fallback for reconciliation
            const finalStatus = await pollBulkLookupJob(accepted.jobId);
            setBulkLookupResult(finalStatus as BulkHubdoLookupResponse);
            setCurrentJobId(null);
        } catch (error) {
            setBulkLookupErrorMessage(error instanceof Error ? error.message : 'Unknown error.');
            setCurrentJobId(null);
        } finally {
            setIsBulkLookupLoading(false);
        }
    }

    async function handleHistoryBulkLookup(targetName: string): Promise<void> {
        if (!canHistoryBulkLookup || isHistoryBulkLookupLoading) {
            return;
        }

        setIsHistoryBulkLookupLoading(true);
        setHistoryBulkLookupErrorMessage(null);
        setHistoryBulkLookupResult(null);
        setCurrentJobId(null);

        try {
            const deduplicatedCpfs = Array.from(new Set(selectedHistoryCpfs));
            const response = await fetch('/api/hubdo-cpf-lookup/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ cpfs: deduplicatedCpfs, mode: historyBulkLookupMode, targetName }),
            });

            const payload = (await response.json()) as BulkHubdoLookupJobAcceptedResponse | GeneratorCpfApiError;

            if (!response.ok) {
                throw new Error((payload as GeneratorCpfApiError).error || 'Bulk HubDo lookup failed.');
            }

            const accepted = payload as BulkHubdoLookupJobAcceptedResponse;

            // Set job ID to subscribe to realtime updates
            setCurrentJobId(accepted.jobId);
            setRealtimeSummary(accepted.summary);

            // Keep polling as fallback for reconciliation
            const finalStatus = await pollBulkLookupJob(accepted.jobId);
            setHistoryBulkLookupResult(finalStatus as BulkHubdoLookupResponse);
            setCurrentJobId(null);

            if (selectedHistoryItem) {
                await handleViewHistoryRecords(selectedHistoryItem.id);
            }
        } catch (error) {
            setHistoryBulkLookupErrorMessage(error instanceof Error ? error.message : 'Unknown error.');
            setCurrentJobId(null);
        } finally {
            setIsHistoryBulkLookupLoading(false);
        }
    }

    async function handleHistoryBulkLookupWithOutTargetName(): Promise<void> {
        if (!canHistoryBulkLookup || isHistoryBulkLookupLoading) {
            return;
        }

        setIsHistoryBulkLookupLoading(true);
        setHistoryBulkLookupErrorMessage(null);
        setHistoryBulkLookupResult(null);
        setCurrentJobId(null);

        try {
            const deduplicatedCpfs = Array.from(new Set(selectedHistoryCpfs));
            const response = await fetch('/api/hubdo-cpf-lookup/bulk-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ cpfs: deduplicatedCpfs, mode: historyBulkLookupMode }),
            });

            const payload = (await response.json()) as BulkHubdoLookupJobAcceptedResponse | GeneratorCpfApiError;

            if (!response.ok) {
                throw new Error((payload as GeneratorCpfApiError).error || 'Simple bulk HubDo lookup failed.');
            }

            const accepted = payload as BulkHubdoLookupJobAcceptedResponse;

            // Set job ID to subscribe to realtime updates
            setCurrentJobId(accepted.jobId);
            setRealtimeSummary(accepted.summary);

            // Keep polling as fallback for reconciliation
            const finalStatus = await pollBulkLookupJob(accepted.jobId);
            setHistoryBulkLookupResult(finalStatus as BulkHubdoLookupResponse);
            setCurrentJobId(null);

            if (selectedHistoryItem) {
                await handleViewHistoryRecords(selectedHistoryItem.id);
            }
        } catch (error) {
            setHistoryBulkLookupErrorMessage(error instanceof Error ? error.message : 'Unknown error.');
            setCurrentJobId(null);
        } finally {
            setIsHistoryBulkLookupLoading(false);
        }
    }
    async function handleBulkLookupWithOutTargetName(): Promise<void> {
        setIsBulkLookupLoading(true);
        setBulkLookupErrorMessage(null);
        setBulkLookupResult(null);
        setCurrentJobId(null);

        try {
            const response = await fetch('/api/hubdo-cpf-lookup/bulk-simple', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ cpfs: selectedCpfs, mode: bulkLookupMode }),
            });

            const payload = (await response.json()) as BulkHubdoLookupJobAcceptedResponse | GeneratorCpfApiError;

            if (!response.ok) {
                throw new Error((payload as GeneratorCpfApiError).error || 'Simple bulk HubDo lookup failed.');
            }

            const accepted = payload as BulkHubdoLookupJobAcceptedResponse;

            // Set job ID to subscribe to realtime updates
            setCurrentJobId(accepted.jobId);
            setRealtimeSummary(accepted.summary);

            // Set initial result while waiting for realtime updates
            setBulkLookupResult({
                job: {
                    id: accepted.jobId,
                    mode: bulkLookupMode,
                    status: 'queued',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    finishedAt: null,
                },
                summary: accepted.summary,
                items: [],
                page: 1,
                pageSize: 50,
                totalItems: 0,
                totalPages: 1,
            });
            const finalStatus = await pollBulkLookupJob(accepted.jobId);
            setBulkLookupResult(finalStatus as BulkHubdoLookupResponse);
            setCurrentJobId(null);
        } catch (error) {
            setBulkLookupErrorMessage(error instanceof Error ? error.message : 'Unknown error.');
            setCurrentJobId(null);
        } finally {
            setIsBulkLookupLoading(false);
        }
    }
    async function confirmBulkLookup(): Promise<void> {
        const targetName = bulkConfirmTargetName.trim();
        if (!targetName) {
            if (bulkConfirmSource === 'search') {
                return handleBulkLookupWithOutTargetName();
            }
            if (bulkConfirmSource === 'history') {
                return handleHistoryBulkLookupWithOutTargetName();
            }
            return;
        }

        if (bulkConfirmSource === 'search') {
            await handleBulkLookup(targetName);
        }

        if (bulkConfirmSource === 'history') {
            await handleHistoryBulkLookup(targetName);
        }

        if (!isBulkLookupLoading && !isHistoryBulkLookupLoading) {
            setIsBulkConfirmOpen(false);
            setBulkConfirmSource(null);
        }
    }

    return (
        <>
            <GeneratorCpfSearchModal
                isOpen={isSearchModalOpen}
                onClose={() => setIsSearchModalOpen(false)}
                onSelectCpf={handleSelectCpfFromModal}
            />
            <Dialog onOpenChange={(open) => {
                if (!open) {
                    closeBulkConfirm();
                }
            }} open={isBulkConfirmOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Confirm bulk queue</DialogTitle>
                        <DialogDescription>
                            Confirm queueing of selected CPFs and provide the target person name.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Target person name</p>
                            <Input
                                className="h-11 rounded-2xl"
                                disabled={isBulkLookupLoading || isHistoryBulkLookupLoading}
                                onChange={(event) => setBulkConfirmTargetName(event.target.value)}
                                placeholder="Ex.: Vanessa Silva dos Reis"
                                value={bulkConfirmTargetName}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <Button
                                className="rounded-2xl"
                                disabled={isBulkLookupLoading || isHistoryBulkLookupLoading}
                                onClick={closeBulkConfirm}
                                type="button"
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                className="rounded-2xl"
                                disabled={isBulkLookupLoading || isHistoryBulkLookupLoading}
                                onClick={() => {
                                    void confirmBulkLookup();
                                }}
                                type="button"
                            >
                                Confirm and queue
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
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
                                        required
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
                                        {isSaving ? 'Saving...' : 'Save Results'}
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
                                    enqueueButtonLabel="Queue selected CPFs"
                                    isEnqueueingSelectedCpfs={isBulkLookupLoading}
                                    onEnqueueSelectedCpfs={selectionEnabled ? () => {
                                        openBulkConfirm('search');
                                    } : undefined}
                                    onSelectNextTen={selectionEnabled ? () => {
                                        selectNextTenCpfs(records);
                                    } : undefined}
                                    onToggleSelectAll={selectionEnabled ? () => {
                                        toggleAllCpfs(records);
                                    } : undefined}
                                    onToggleCpfSelection={toggleCpfSelection}
                                    onToggleSelectionMode={toggleSelectionMode}
                                    records={records}
                                    selectedCount={selectedCpfs.length}
                                    selectedCpfs={selectedCpfs}
                                    selectionEnabled={selectionEnabled}
                                />

                                {selectionEnabled ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                {selectedCpfs.length} CPF(s) selected for HubDo lookup.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <select
                                                    aria-label="Bulk HubDo lookup mode"
                                                    className="h-10 rounded-2xl border bg-background px-3 text-sm"
                                                    disabled={isBulkLookupLoading}
                                                    onChange={(event) => setBulkLookupMode(event.target.value as 'normal' | 'turbo')}
                                                    value={bulkLookupMode}
                                                >
                                                    <option value="normal">Normal (5 credits)</option>
                                                    <option value="turbo">Turbo (25 credits)</option>
                                                </select>
                                            </div>
                                        </div>

                                        {bulkLookupErrorMessage ? (
                                            <FriendlyMessage
                                                description={bulkLookupErrorMessage}
                                                title="Bulk lookup failed"
                                                variant="error"
                                            />
                                        ) : null}
                                        {isHistoryBulkLookupLoading && realtimeSummary ? (
                                            <FriendlyMessage
                                                description={`${realtimeSummary.success} success, ${realtimeSummary.error + realtimeSummary.deadLetter} error(s), ${realtimeSummary.queued + realtimeSummary.processing} pending...`}
                                                title="Processing"
                                                variant="info"
                                            />
                                        ) : null}
                                        {isBulkLookupLoading && realtimeSummary ? (
                                            <FriendlyMessage
                                                description={`${realtimeSummary.success} success, ${realtimeSummary.error + realtimeSummary.deadLetter} error(s), ${realtimeSummary.queued + realtimeSummary.processing} pending...`}
                                                title="Processing"
                                                variant="info"
                                            />
                                        ) : null}

                                        {bulkLookupResult ? (
                                            <FriendlyMessage
                                                description={`${bulkLookupResult.summary.success} success, ${bulkLookupResult.summary.error + bulkLookupResult.summary.deadLetter} error(s), ${bulkLookupResult.summary.total} processed in ${bulkLookupMode} mode.`}
                                                title="Bulk lookup completed"
                                                variant={bulkLookupResult.summary.error + bulkLookupResult.summary.deadLetter > 0 ? 'warning' : 'success'}
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
                                            <>
                                                <GeneratorCpfResultsTable
                                                    enqueueButtonLabel="Queue selected CPFs"
                                                    isEnqueueingSelectedCpfs={isHistoryBulkLookupLoading}
                                                    onEnqueueSelectedCpfs={historySelectionEnabled ? () => {
                                                        openBulkConfirm('history');
                                                    } : undefined}
                                                    onSelectNextTen={historySelectionEnabled ? () => {
                                                        selectNextTenHistoryCpfs(selectedHistoryItem.resultRecords);
                                                    } : undefined}
                                                    onToggleSelectAll={historySelectionEnabled ? () => {
                                                        toggleAllHistoryCpfs(selectedHistoryItem.resultRecords);
                                                    } : undefined}
                                                    onToggleCpfSelection={toggleHistoryCpfSelection}
                                                    onToggleSelectionMode={toggleHistorySelectionMode}
                                                    records={selectedHistoryItem.resultRecords}
                                                    selectedCount={selectedHistoryCpfs.length}
                                                    selectedCpfs={selectedHistoryCpfs}
                                                    selectionEnabled={historySelectionEnabled}
                                                    showHubdoLookupStatus
                                                />

                                                {historySelectionEnabled ? (
                                                    <div className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-muted-foreground">
                                                                {selectedHistoryCpfs.length} CPF(s) selected for HubDo lookup.
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                <select
                                                                    aria-label="History bulk HubDo lookup mode"
                                                                    className="h-10 rounded-2xl border bg-background px-3 text-sm"
                                                                    disabled={isHistoryBulkLookupLoading}
                                                                    onChange={(event) => setHistoryBulkLookupMode(event.target.value as 'normal' | 'turbo')}
                                                                    value={historyBulkLookupMode}
                                                                >
                                                                    <option value="normal">Normal (5 credits)</option>
                                                                    <option value="turbo">Turbo (25 credits)</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {historyBulkLookupErrorMessage ? (
                                                            <FriendlyMessage
                                                                description={historyBulkLookupErrorMessage}
                                                                title="Bulk lookup failed"
                                                                variant="error"
                                                            />
                                                        ) : null}

                                                        {historyBulkLookupResult ? (
                                                            <FriendlyMessage
                                                                description={`${historyBulkLookupResult.summary.success} success, ${historyBulkLookupResult.summary.error + historyBulkLookupResult.summary.deadLetter} error(s), ${historyBulkLookupResult.summary.total} processed in ${historyBulkLookupMode} mode.`}
                                                                title="Bulk lookup completed"
                                                                variant={historyBulkLookupResult.summary.error + historyBulkLookupResult.summary.deadLetter > 0 ? 'warning' : 'success'}
                                                            />
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                            </>
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

'use client';

import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HubdoCpfLookupResponse } from '@/hubdoCpf';
import { History, SearchCheck } from 'lucide-react';
import { useState } from 'react';
import { HubdoCpfHistoryTable } from './hubdo-cpf-history-table';
import { HubdoCpfResultCard } from './hubdo-cpf-result-card';
import { HubdoCpfSearchForm } from './hubdo-cpf-search-form';

type Tab = 'search' | 'history';

export function HubdoCpfLookupClient() {
    const [activeTab, setActiveTab] = useState<Tab>('search');
    const [cpf, setCpf] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [mode, setMode] = useState<'normal' | 'turbo'>('normal');
    const [isSearching, setIsSearching] = useState(false);
    const [lastResult, setLastResult] = useState<HubdoCpfLookupResponse | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [historyPage, setHistoryPage] = useState(1);
    const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

    async function handleSearch(): Promise<void> {
        setIsSearching(true);
        setSearchError(null);
        setLastResult(null);

        try {
            const params = new URLSearchParams();
            params.set('cpf', cpf);

            if (birthDate.trim()) {
                params.set('birthDate', birthDate.trim());
            }

            params.set('mode', mode);

            const response = await fetch(`/api/hubdo-cpf-lookup?${params.toString()}`, {
                headers: { Accept: 'application/json' },
            });

            const data = (await response.json()) as HubdoCpfLookupResponse;
            setLastResult(data);

            if (!response.ok || data.status === 'error') {
                setSearchError(data.message || 'Unable to check the CPF.');
                return;
            }

            setHistoryRefreshKey((current) => current + 1);
        } catch (error) {
            setSearchError(error instanceof Error ? error.message : 'Falha de conexão ao consultar o serviço.');
        } finally {
            setIsSearching(false);
        }
    }

    function handleReset(): void {
        setCpf('');
        setBirthDate('');
        setMode('normal');
        setLastResult(null);
        setSearchError(null);
    }

    function handleSelectFromHistory(cpfValue: string): void {
        setCpf(cpfValue);
        setActiveTab('search');
    }

    return (
        <div className="space-y-6">
            <div className="inline-flex rounded-2xl border bg-card p-1 shadow-sm">
                <Button
                    className="rounded-xl"
                    onClick={() => setActiveTab('search')}
                    type="button"
                    variant={activeTab === 'search' ? 'default' : 'ghost'}
                >
                    <SearchCheck className="mr-2 h-4 w-4" />
                    Search CPF
                </Button>
                <Button
                    className="rounded-xl"
                    onClick={() => setActiveTab('history')}
                    type="button"
                    variant={activeTab === 'history' ? 'default' : 'ghost'}
                >
                    <History className="mr-2 h-4 w-4" />
                    History
                </Button>
            </div>

            {activeTab === 'search' ? (
                <div className="space-y-4">
                    <Card className="rounded-3xl border shadow-sm">
                        <CardHeader>
                            <CardTitle>New lookup</CardTitle>
                            <CardDescription>
                                Enter the CPF, choose the response mode, and review the estimated cost before submitting.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HubdoCpfSearchForm
                                birthDate={birthDate}
                                cpf={cpf}
                                isLoading={isSearching}
                                mode={mode}
                                onBirthDateChange={setBirthDate}
                                onCpfChange={setCpf}
                                onModeChange={setMode}
                                onReset={handleReset}
                                onSearch={() => {
                                    void handleSearch();
                                }}
                            />
                        </CardContent>
                    </Card>

                    {searchError ? (
                        <FriendlyMessage description={searchError} title="The lookup could not be completed" variant="error" />
                    ) : null}

                    {lastResult && lastResult.status === 'success' ? <HubdoCpfResultCard result={lastResult} /> : null}

                    {!lastResult && !searchError ? (
                        <FriendlyMessage
                            description="Completed lookups remain available in history for follow-up checks and operational traceability."
                            title="Automatic lookup history"
                            variant="info"
                        />
                    ) : null}
                </div>
            ) : null}

            {activeTab === 'history' ? (
                <HubdoCpfHistoryTable
                    onPageChange={setHistoryPage}
                    onSelectCpf={handleSelectFromHistory}
                    page={historyPage}
                    refreshKey={historyRefreshKey}
                />
            ) : null}
        </div>
    );
}
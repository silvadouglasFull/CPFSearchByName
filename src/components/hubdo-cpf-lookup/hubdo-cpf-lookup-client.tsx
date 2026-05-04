'use client';

import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HubdoCpfLookupResponse } from '@/hubdoCpf';
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
                setSearchError(data.message || 'Erro ao consultar CPF.');
                return;
            }

            setHistoryRefreshKey((current) => current + 1);
        } catch (error) {
            setSearchError(error instanceof Error ? error.message : 'Connection error');
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
            <div className="flex gap-2">
                <Button
                    className="rounded-2xl"
                    onClick={() => setActiveTab('search')}
                    type="button"
                    variant={activeTab === 'search' ? 'default' : 'outline'}
                >
                    Buscar CPF
                </Button>
                <Button
                    className="rounded-2xl"
                    onClick={() => setActiveTab('history')}
                    type="button"
                    variant={activeTab === 'history' ? 'default' : 'outline'}
                >
                    Histórico
                </Button>
            </div>

            {activeTab === 'search' ? (
                <div className="space-y-4">
                    <Card className="rounded-3xl shadow-sm">
                        <CardHeader>
                            <CardTitle>Dados da Consulta</CardTitle>
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
                        <FriendlyMessage description={searchError} title="Erro na Consulta" variant="error" />
                    ) : null}

                    {lastResult && lastResult.status === 'success' ? <HubdoCpfResultCard result={lastResult} /> : null}
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
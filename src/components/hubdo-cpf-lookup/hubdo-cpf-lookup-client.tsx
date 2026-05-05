'use client';

import { Button } from '@/components/ui/button';
import { History, SearchCheck } from 'lucide-react';
import { useState } from 'react';
import { HubdoCpfHistoryTable } from './hubdo-cpf-history-table';
import { HubDoCpfForm } from './hubdo-cpf-lookup-form';

type Tab = 'search' | 'history';

export function HubdoCpfLookupClient() {
    const [activeTab, setActiveTab] = useState<Tab>('search');
    const [prefilledCpf, setPrefilledCpf] = useState('');
    const [historyPage, setHistoryPage] = useState(1);
    const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

    function handleSelectFromHistory(cpfValue: string): void {
        setPrefilledCpf(cpfValue);
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
                    <HubDoCpfForm
                        initialCpf={prefilledCpf}
                        onLookupSuccess={() => {
                            setHistoryRefreshKey((current) => current + 1);
                        }}
                    />
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
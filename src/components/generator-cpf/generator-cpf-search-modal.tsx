'use client';

import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

interface CpfRecord {
    id: string;
    cpf: string;
    formattedCpf: string;
    baseNineDigits: string;
}

interface GeneratorCpfSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCpf: (baseNineDigits: string) => void;
}

const DEFAULT_LIMIT = 50;

export function GeneratorCpfSearchModal({ isOpen, onClose, onSelectCpf }: GeneratorCpfSearchModalProps) {
    const [records, setRecords] = useState<CpfRecord[]>([]);
    const [searchInput, setSearchInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    async function loadRecords(searchTerm: string = ''): Promise<void> {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const params = new URLSearchParams();
            params.set('limit', String(DEFAULT_LIMIT));
            params.set('offset', '0');
            if (searchTerm.trim()) {
                params.set('search', searchTerm.trim());
            }

            const response = await fetch(`/api/generator-cpf-history-search-records?${params.toString()}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                throw new Error('Failed to load CPF records.');
            }

            const data = (await response.json()) as { records: CpfRecord[] };
            setRecords(data.records);
            setHasLoaded(true);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setErrorMessage(message);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSelectCpf(baseNineDigits: string): void {
        onSelectCpf(baseNineDigits);
        onClose();
    }

    function handleSearch(): void {
        void loadRecords(searchInput);
    }

    function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>): void {
        if (event.key === 'Enter') {
            handleSearch();
        }
    }

    function handleOpenChange(open: boolean): void {
        if (open) {
            if (!hasLoaded) {
                void loadRecords();
            }
        } else {
            onClose();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[80vh] flex flex-col gap-4 w-full max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Select partial CPF from history</DialogTitle>
                    <DialogDescription>
                        Search and select a partial CPF from previously generated candidates.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                    <Input
                        className="h-10 rounded-lg"
                        onChange={(event) => setSearchInput(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search by CPF, formatted CPF, or base 9 digits..."
                        value={searchInput}
                    />
                    <Button
                        className="h-10 rounded-lg px-4"
                        onClick={handleSearch}
                        type="button"
                        variant="default"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>

                {isLoading && (
                    <FriendlyMessage
                        description="Loading CPF records..."
                        title="Loading"
                        variant="info"
                    />
                )}

                {errorMessage && (
                    <FriendlyMessage
                        description={errorMessage}
                        title="Error loading records"
                        variant="error"
                    />
                )}

                {!isLoading && !errorMessage && records.length === 0 && hasLoaded && (
                    <FriendlyMessage
                        description="No CPF records found in generation history."
                        title="No records"
                        variant="info"
                    />
                )}

                {!isLoading && records.length > 0 && (
                    <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(80vh-300px)]">
                        {records.map((record) => (
                            <button
                                key={record.id}
                                onClick={() => handleSelectCpf(record.baseNineDigits)}
                                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-slate-900">CPF: {record.cpf}</p>
                                        <p className="text-sm text-slate-600">Formatted: {record.formattedCpf}</p>
                                        <p className="text-xs text-slate-500 mt-1">Base 9 digits: {record.baseNineDigits}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {!isLoading && searchInput && records.length === 0 && hasLoaded && (
                    <FriendlyMessage
                        description="No records match your search filter."
                        title="No results"
                        variant="info"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}

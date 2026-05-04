'use client';

import { FriendlyMessage } from '@/components/shared/friendly-message';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

interface CpfRecord {
    id: string;
    name: string;
    cpf: string;
    relation: string;
}

interface CpfSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectCpf: (cpf: string) => void;
}

const DEFAULT_LIMIT = 50;

export function CpfSearchModal({ isOpen, onClose, onSelectCpf }: CpfSearchModalProps) {
    const [records, setRecords] = useState<CpfRecord[]>([]);
    const [searchFilter, setSearchFilter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    const filteredRecords = useMemo(() => {
        const filter = searchFilter.toLowerCase().trim();
        if (!filter) return records;
        return records.filter(
            (record) =>
                record.name.toLowerCase().includes(filter) ||
                record.cpf.toLowerCase().includes(filter)
        );
    }, [records, searchFilter]);

    async function loadRecords(): Promise<void> {
        if (hasLoaded && records.length > 0) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const response = await fetch(`/api/get-cpfs-by-name-search-records?limit=${DEFAULT_LIMIT}&offset=0`, {
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

    function handleSelectCpf(cpf: string): void {
        onSelectCpf(cpf);
        onClose();
    }

    function handleOpenChange(open: boolean): void {
        if (open) {
            void loadRecords();
        } else {
            onClose();
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-h-[80vh] flex flex-col gap-4 w-full max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Select CPF from history</DialogTitle>
                    <DialogDescription>
                        Search and select a CPF from collected search records.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex gap-2">
                    <Input
                        className="h-10 rounded-lg"
                        onChange={(event) => setSearchFilter(event.target.value)}
                        placeholder="Search by name or CPF..."
                        value={searchFilter}
                    />
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
                        description="No CPF records found in search history."
                        title="No records"
                        variant="info"
                    />
                )}

                {!isLoading && filteredRecords.length > 0 && (
                    <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(80vh-300px)]">
                        {filteredRecords.map((record) => (
                            <button
                                key={record.id}
                                onClick={() => handleSelectCpf(record.cpf)}
                                className="w-full text-left p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-slate-900">{record.name}</p>
                                        <p className="text-sm text-slate-600">CPF: {record.cpf}</p>
                                        {record.relation && (
                                            <p className="text-xs text-slate-500 mt-1">{record.relation}</p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {!isLoading && searchFilter && filteredRecords.length === 0 && records.length > 0 && (
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

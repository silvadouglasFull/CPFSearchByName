'use client';

import { FilterCpfResultsTable } from '@/components/filter-by-cpf/filter-cpf-results-table';
import { FilterByCpfApiError, FilterByCpfApiResponse, PortalResultRecord } from '@/components/filter-by-cpf/types';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const PARTIAL_CPF_PLACEHOLDER = '009108';

export function FilterCpfClient() {
    const [partialCpf, setPartialCpf] = useState('');
    const [records, setRecords] = useState<PortalResultRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const canSearch = useMemo(() => partialCpf.trim().length > 0, [partialCpf]);

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

    return (
        <section className="space-y-6">
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
                </CardContent>
            </Card>

            {errorMessage ? (
                <Alert className="rounded-2xl border-destructive/50 text-destructive">
                    <AlertTitle>Request failed</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            ) : null}

            {hasSearched && !isLoading && records.length === 0 && !errorMessage ? (
                <Alert className="rounded-2xl">
                    <AlertTitle>No matching records</AlertTitle>
                    <AlertDescription>
                        No CPF records matched this partial value in resultados_portal.json.
                    </AlertDescription>
                </Alert>
            ) : null}

            {records.length > 0 ? <FilterCpfResultsTable records={records} /> : null}
        </section>
    );
}

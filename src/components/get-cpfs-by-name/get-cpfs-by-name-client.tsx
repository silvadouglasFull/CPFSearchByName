'use client';

import { GetCpfsByNameResultsTable } from '@/components/get-cpfs-by-name/get-cpfs-by-name-results-table';
import { GetCpfsByNameApiError, GetCpfsByNameApiResponse, PortalRecord } from '@/components/get-cpfs-by-name/types';
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
import { Search } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const SEARCH_NAME_PLACEHOLDER = 'Maria Silva';

export function GetCpfsByNameClient() {
    const [searchName, setSearchName] = useState('');
    const [records, setRecords] = useState<PortalRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const canSearch = useMemo(() => searchName.trim().length > 0, [searchName]);

    async function handleSearch(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!canSearch) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        setHasSearched(true);

        try {
            const response = await fetch(`/api/get-cpfs-by-name?searchName=${encodeURIComponent(searchName.trim())}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as GetCpfsByNameApiError;
                throw new Error(errorPayload.error || 'Failed to collect records by name.');
            }

            const payload = (await response.json()) as GetCpfsByNameApiResponse;
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
                    description="No records were collected for this name across the configured pages."
                    title="No records found"
                    variant="info"
                />
            ) : null}

            {records.length > 0 ? <GetCpfsByNameResultsTable records={records} /> : null}
        </section>
    );
}

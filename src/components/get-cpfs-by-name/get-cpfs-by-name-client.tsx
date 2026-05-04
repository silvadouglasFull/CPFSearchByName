'use client';

import { GetCpfsByNameProgress } from '@/components/get-cpfs-by-name/get-cpfs-by-name-progress';
import { GetCpfsByNameResultsTable } from '@/components/get-cpfs-by-name/get-cpfs-by-name-results-table';
import { CollectionEvent, PageStatus, PortalRecord } from '@/components/get-cpfs-by-name/types';
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
const TOTAL_PORTAL_PAGES = 6;

export function GetCpfsByNameClient() {
    const [searchName, setSearchName] = useState('');
    const [records, setRecords] = useState<PortalRecord[]>([]);
    const [pageStatuses, setPageStatuses] = useState<PageStatus[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [totalRecords, setTotalRecords] = useState<number | null>(null);

    const canSearch = useMemo(() => searchName.trim().length > 0, [searchName]);

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

            {totalRecords !== null && records.length === 0 && !errorMessage ? (
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


'use client';

import { CredifyPhoneHistoryTable } from '@/components/credifyapis-phone-lookup/credify-phone-history-table';
import { CredifyPhoneItem, CredifyPhoneJobSummary } from '@/components/credifyapis-phone-lookup/types';
import { useCredifyPhoneSocket } from '@/components/credifyapis-phone-lookup/use-credify-phone-socket';
import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';

export function CredifyPhoneLookupClient() {
    const [phone, setPhone] = useState('');
    const [jobId, setJobId] = useState<string | null>(null);
    const [summary, setSummary] = useState<CredifyPhoneJobSummary | null>(null);
    const [items, setItems] = useState<Record<string, CredifyPhoneItem>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

    useCredifyPhoneSocket(jobId, {
        onItemUpdated: (event) => {
            setItems((current) => ({
                ...current,
                [event.itemId]: {
                    id: event.itemId,
                    normalizedPhone: event.normalizedPhone,
                    status: event.status,
                    attemptCount: event.attemptCount,
                    providerCode: event.providerCode,
                    errorCode: event.errorCode,
                    errorMessage: event.errorMessage,
                    updatedAt: event.updatedAt,
                },
            }));
        },
        onJobUpdated: (event) => {
            setSummary(event.summary);
        },
        onJobCompleted: () => {
            setHistoryRefreshKey((value) => value + 1);
        },
        onJobFailed: () => {
            setError('Job failed before completion.');
        },
        onError: (message) => {
            setError(message);
        },
    });

    const itemList = useMemo(() => Object.values(items).sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1)), [items]);

    async function submitPhone(): Promise<void> {
        setError(null);
        setIsSubmitting(true);
        setItems({});

        try {
            const response = await fetch('/api/credifyapis-phone-lookup', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ phone }),
            });

            const payload = (await response.json()) as {
                jobId?: string;
                summary?: CredifyPhoneJobSummary;
                error?: string;
            };

            if (!response.ok || !payload.jobId) {
                setError(payload.error || 'Failed to enqueue phone lookup.');
                return;
            }

            setJobId(payload.jobId);
            setSummary(payload.summary || null);
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : 'Unexpected error.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="space-y-6">
            <Card className="rounded-3xl border shadow-sm">
                <CardHeader>
                    <CardTitle>Queue a phone lookup</CardTitle>
                    <CardDescription>
                        Enter the target phone number. The request is queued and processed asynchronously.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-col gap-3 md:flex-row">
                        <Input
                            onChange={(event) => setPhone(event.target.value)}
                            placeholder="(11) 99999-8888"
                            value={phone}
                        />
                        <Button disabled={isSubmitting || !phone.trim()} onClick={() => void submitPhone()} type="button">
                            {isSubmitting ? 'Queueing...' : 'Consultar telefone'}
                        </Button>
                    </div>

                    {jobId ? <p className="text-sm text-muted-foreground">Current job: {jobId}</p> : null}
                    {summary ? (
                        <p className="text-sm text-muted-foreground">
                            Total {summary.total} • Queued {summary.queued} • Processing {summary.processing} • Success {summary.success} • Not found {summary.notFound} • Error {summary.error}
                        </p>
                    ) : null}
                </CardContent>
            </Card>

            {error ? <FriendlyMessage title="Lookup flow error" description={error} variant="error" /> : null}

            {itemList.length ? (
                <Card className="rounded-3xl border shadow-sm">
                    <CardHeader>
                        <CardTitle>Live progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {itemList.map((item) => (
                            <div className="rounded-xl border p-3" key={item.id}>
                                <p className="text-sm font-medium">{item.normalizedPhone} • {item.status}</p>
                                <p className="text-xs text-muted-foreground">
                                    Attempt {item.attemptCount}
                                    {item.errorMessage ? ` • ${item.errorMessage}` : ''}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ) : null}

            <CredifyPhoneHistoryTable refreshKey={historyRefreshKey} />
        </div>
    );
}

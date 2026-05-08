'use client';

import { PaginatedCredifyPhoneLookupHistory } from '@/components/credifyapis-phone-lookup/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

type Props = {
    refreshKey: number;
};

export function CredifyPhoneHistoryTable({ refreshKey }: Props) {
    const [data, setData] = useState<PaginatedCredifyPhoneLookupHistory | null>(null);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function load(): Promise<void> {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/credifyapis-phone-lookup/history?page=${page}&pageSize=10`, {
                    headers: { Accept: 'application/json' },
                });
                const payload = (await response.json()) as PaginatedCredifyPhoneLookupHistory;
                setData(payload);
            } finally {
                setIsLoading(false);
            }
        }

        void load();
    }, [page, refreshKey]);

    return (
        <Card className="rounded-3xl border shadow-sm">
            <CardHeader>
                <CardTitle>Lookup history</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? <p className="text-sm text-muted-foreground">Loading history...</p> : null}

                {!isLoading && data?.items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No Credify lookups recorded yet.</p>
                ) : null}

                {!isLoading && data?.items.length ? (
                    <div className="space-y-2">
                        {data.items.map((item) => (
                            <div className="rounded-xl border p-3" key={item.id}>
                                <p className="text-sm font-medium">{item.rawPhone} • {item.status}</p>
                                <p className="text-xs text-muted-foreground">
                                    {item.nome || 'No name returned'} {item.cpf ? `• CPF ${item.cpf}` : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : null}

                <div className="flex gap-2">
                    <Button
                        disabled={page <= 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                        type="button"
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <Button
                        disabled={!data || page >= data.totalPages}
                        onClick={() => setPage((current) => current + 1)}
                        type="button"
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

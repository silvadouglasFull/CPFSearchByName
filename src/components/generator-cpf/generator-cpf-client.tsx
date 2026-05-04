'use client';

import { GeneratorCpfResultsTable } from '@/components/generator-cpf/generator-cpf-results-table';
import { GeneratedCpfRecord, GeneratorCpfApiError, GeneratorCpfApiResponse } from '@/components/generator-cpf/types';
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
import { WandSparkles } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const PARTIAL_CPF_PLACEHOLDER = '09108';
const REGION_DIGIT_PLACEHOLDER = '8';

export function GeneratorCpfClient() {
    const [partialCpf, setPartialCpf] = useState('');
    const [regionDigit, setRegionDigit] = useState('');
    const [records, setRecords] = useState<GeneratedCpfRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [hasGenerated, setHasGenerated] = useState(false);

    const canGenerate = useMemo(() => partialCpf.trim().length > 0, [partialCpf]);

    async function handleGenerate(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!canGenerate) {
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);
        setHasGenerated(true);

        try {
            const query = new URLSearchParams({ partialCpf: partialCpf.trim() });

            if (regionDigit.trim()) {
                query.set('regionDigit', regionDigit.trim());
            }

            const response = await fetch(`/api/generator-cpf?${query.toString()}`, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as GeneratorCpfApiError;
                throw new Error(errorPayload.error || 'Failed to generate CPF candidates.');
            }

            const payload = (await response.json()) as GeneratorCpfApiResponse;
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
                    <CardTitle>Generate CPF Candidates</CardTitle>
                    <CardDescription>
                        Provide a partial CPF from 1 to 9 digits and, optionally, a region digit from 0 to 9.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="grid gap-3 md:grid-cols-[1fr_120px_auto]" onSubmit={handleGenerate}>
                        <Input
                            className="h-11 rounded-2xl"
                            onChange={(event) => setPartialCpf(event.target.value)}
                            placeholder={PARTIAL_CPF_PLACEHOLDER}
                            value={partialCpf}
                        />
                        <Input
                            className="h-11 rounded-2xl"
                            maxLength={1}
                            onChange={(event) => setRegionDigit(event.target.value)}
                            placeholder={REGION_DIGIT_PLACEHOLDER}
                            value={regionDigit}
                        />
                        <Button className="h-11 rounded-2xl px-6" disabled={!canGenerate || isLoading} type="submit">
                            <WandSparkles className="mr-2 h-4 w-4" />
                            {isLoading ? 'Generating...' : 'Generate'}
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

            {hasGenerated && !isLoading && records.length === 0 && !errorMessage ? (
                <FriendlyMessage
                    description="No valid CPF candidates were generated for the informed values."
                    title="No candidates found"
                    variant="info"
                />
            ) : null}

            {records.length > 0 ? <GeneratorCpfResultsTable records={records} /> : null}
        </section>
    );
}

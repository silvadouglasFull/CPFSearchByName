'use client';

import { AppSettingsFields } from '@/appSettings/domain/types';
import { FriendlyMessage } from '@/components/shared/friendly-message';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Save } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';

interface AppSettingsApiResponse {
    settings: AppSettingsFields;
}

interface AppSettingsApiError {
    error: string;
}

const NUMERIC_FIELDS: Array<keyof AppSettingsFields> = [
    'resultsPerPage',
    'totalPages',
    'pageResponseTimeoutMs',
    'pageNavigationTimeoutMs',
    'pageSelectorTimeoutMs',
    'pageThrottleDelayMs',
    'jsonOutputIndentSpaces',
    'cliFirstUserArgIndex',
    'firstPageNumber',
];

const TEXT_FIELDS: Array<keyof AppSettingsFields> = [
    'fileEncodingUtf8',
    'searchPageUrl',
    'detailsPageUrl',
    'searchApiHostname',
    'searchApiPathname',
    'defaultPageSelector',
];

const LABELS: Record<keyof AppSettingsFields, string> = {
    resultsPerPage: 'Results Per Page',
    totalPages: 'Total Pages',
    pageResponseTimeoutMs: 'Page Response Timeout (ms)',
    pageNavigationTimeoutMs: 'Page Navigation Timeout (ms)',
    pageSelectorTimeoutMs: 'Page Selector Timeout (ms)',
    pageThrottleDelayMs: 'Page Throttle Delay (ms)',
    jsonOutputIndentSpaces: 'JSON Output Indent Spaces',
    fileEncodingUtf8: 'File Encoding',
    cliFirstUserArgIndex: 'CLI First User Arg Index',
    firstPageNumber: 'First Page Number',
    searchPageUrl: 'Search Page URL',
    detailsPageUrl: 'Details Page URL',
    searchApiHostname: 'Search API Hostname',
    searchApiPathname: 'Search API Pathname',
    defaultPageSelector: 'Default Page Selector',
};

export function AppSettingsClient() {
    const [form, setForm] = useState<AppSettingsFields | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        async function loadSettings(): Promise<void> {
            setIsLoading(true);
            setErrorMessage(null);

            try {
                const response = await fetch('/api/app-settings', {
                    method: 'GET',
                    headers: { Accept: 'application/json' },
                });

                if (!response.ok) {
                    const errorPayload = (await response.json()) as AppSettingsApiError;
                    throw new Error(errorPayload.error || 'Failed to load app settings.');
                }

                const payload = (await response.json()) as AppSettingsApiResponse;
                setForm(payload.settings);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error.';
                setErrorMessage(message);
            } finally {
                setIsLoading(false);
            }
        }

        void loadSettings();
    }, []);

    const canSave = useMemo(() => {
        if (!form) {
            return false;
        }

        return NUMERIC_FIELDS.every((field) => Number(form[field]) > 0)
            && TEXT_FIELDS.every((field) => String(form[field]).trim().length > 0);
    }, [form]);

    function updateNumericField(field: keyof AppSettingsFields, value: string): void {
        if (!form) {
            return;
        }

        const parsed = Number(value);

        setForm({
            ...form,
            [field]: Number.isFinite(parsed) ? parsed : 0,
        });
        setSuccessMessage(null);
    }

    function updateTextField(field: keyof AppSettingsFields, value: string): void {
        if (!form) {
            return;
        }

        setForm({
            ...form,
            [field]: value,
        });
        setSuccessMessage(null);
    }

    async function handleSave(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!form || !canSave) {
            return;
        }

        setIsSaving(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('/api/app-settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(form),
            });

            if (!response.ok) {
                const errorPayload = (await response.json()) as AppSettingsApiError;
                throw new Error(errorPayload.error || 'Failed to save app settings.');
            }

            const payload = (await response.json()) as AppSettingsApiResponse;
            setForm(payload.settings);
            setSuccessMessage('Settings saved successfully.');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error.';
            setErrorMessage(message);
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <FriendlyMessage
                title="Loading settings"
                description="Fetching persisted app settings from the database."
                variant="info"
            />
        );
    }

    if (!form) {
        return (
            <FriendlyMessage
                title="Unable to load settings"
                description={errorMessage || 'Could not read app settings.'}
                variant="error"
            />
        );
    }

    return (
        <section className="space-y-6">
            <Card className="rounded-3xl shadow-sm">
                <CardHeader>
                    <CardTitle>Global Runtime Configuration</CardTitle>
                    <CardDescription>
                        These settings are shared across all users in the current phase.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSave}>
                        <div className="grid gap-4 md:grid-cols-2">
                            {NUMERIC_FIELDS.map((field) => (
                                <label className="space-y-2" key={field}>
                                    <span className="text-sm font-medium">{LABELS[field]}</span>
                                    <Input
                                        className="h-11 rounded-2xl"
                                        min={1}
                                        onChange={(event) => updateNumericField(field, event.target.value)}
                                        type="number"
                                        value={String(form[field])}
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            {TEXT_FIELDS.map((field) => (
                                <label className="space-y-2" key={field}>
                                    <span className="text-sm font-medium">{LABELS[field]}</span>
                                    <Input
                                        className="h-11 rounded-2xl"
                                        onChange={(event) => updateTextField(field, event.target.value)}
                                        value={String(form[field])}
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <Button className="h-11 rounded-2xl px-6" disabled={!canSave || isSaving} type="submit">
                                <Save className="mr-2 size-4" />
                                {isSaving ? 'Saving...' : 'Save settings'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {errorMessage ? (
                <FriendlyMessage title="Save failed" description={errorMessage} variant="error" />
            ) : null}

            {successMessage ? (
                <FriendlyMessage title="Success" description={successMessage} variant="success" />
            ) : null}
        </section>
    );
}

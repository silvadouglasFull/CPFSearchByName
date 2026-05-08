import { CredifyPhoneLookupClient } from '@/components/credifyapis-phone-lookup/credify-phone-lookup-client';
import { Badge } from '@/components/ui/badge';
import { PhoneCall, RadioTower, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Credify Phone Lookup',
    description: 'Queue and track Credify phone lookups in real time.',
};

export default function CredifyPhoneLookupPage() {
    return (
        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:gap-8 md:px-8 md:py-10">
            <header className="overflow-hidden rounded-3xl border bg-card shadow-sm">
                <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.3fr_0.9fr] md:px-8 md:py-8">
                    <div className="space-y-4">
                        <Badge className="rounded-full" variant="secondary">
                            Credify APIs
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Phone-driven person lookup</h1>
                            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                                Submit phone numbers to RabbitMQ, process through Credify with backend fetch requests, and monitor progress in real time.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 rounded-3xl border bg-linear-to-br from-muted/20 to-background p-4">
                        <div className="flex items-start gap-3 rounded-2xl border bg-background/80 p-4">
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                            <div>
                                <p className="text-sm font-medium">Server-only credentials</p>
                                <p className="text-sm text-muted-foreground">ClientID and ClientSecret stay in backend env vars.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-2xl border bg-background/80 p-4">
                            <PhoneCall className="mt-0.5 h-5 w-5 text-sky-600" />
                            <div>
                                <p className="text-sm font-medium">Single or bulk flow</p>
                                <p className="text-sm text-muted-foreground">One queue architecture for one-off and mass submissions.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 rounded-2xl border bg-background/80 p-4">
                            <RadioTower className="mt-0.5 h-5 w-5 text-amber-600" />
                            <div>
                                <p className="text-sm font-medium">Realtime tracking</p>
                                <p className="text-sm text-muted-foreground">Socket events reflect queue progression and terminal status.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <CredifyPhoneLookupClient />
        </main>
    );
}

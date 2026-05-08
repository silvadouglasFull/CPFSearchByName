import { Badge } from '@/components/ui/badge';

export function LandingHero() {
    return (
        <section className="space-y-4 rounded-3xl border bg-card p-6 shadow-sm md:p-10">
            <Badge className="rounded-full" variant="secondary">
                verifyDocs
            </Badge>
            <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">CPF anti-fraud investigation modules</h1>
            <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                A simple landing page with one section per system module. Each block shows a real screen capture and explains
                how the module helps users move from partial data to evidence-backed CPF verification.
            </p>
        </section>
    );
}

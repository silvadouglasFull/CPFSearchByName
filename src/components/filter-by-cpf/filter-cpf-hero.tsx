import { Badge } from '@/components/ui/badge';

export function FilterCpfHero() {
    return (
        <header className="space-y-4 rounded-3xl border bg-card p-6 shadow-sm md:p-10">
            <Badge className="rounded-full px-3 py-1 text-xs tracking-wide uppercase">
                Next.js + shadcn/ui
            </Badge>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
                    CPF Partial Filter
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                    Search records from resultados_portal.json using a partial CPF. This page reuses the
                    existing filterByCpf domain module through a dedicated API route.
                </p>
            </div>
        </header>
    );
}

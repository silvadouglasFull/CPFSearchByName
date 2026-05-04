export function GeneratorCpfHero() {
    return (
        <header className="space-y-4 rounded-3xl border bg-card p-6 shadow-sm md:p-10">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
                    CPF Candidate Generator
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                    Generate valid CPF candidates using a partial CPF and an optional region digit. This page
                    reuses the existing generatorCpf module through a dedicated API route.
                </p>
            </div>
        </header>
    );
}

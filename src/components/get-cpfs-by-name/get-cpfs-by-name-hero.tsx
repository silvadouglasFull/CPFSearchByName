export function GetCpfsByNameHero() {
    return (
        <header className="space-y-4 rounded-3xl border bg-card p-6 shadow-sm md:p-10">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
                    Get CPFs by Name
                </h1>
                <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                    Collect CPF records from portal pages by person name. This page reuses the existing
                    getCpfsByName module through a dedicated API route.
                </p>
            </div>
        </header>
    );
}

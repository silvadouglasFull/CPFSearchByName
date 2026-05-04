export function AppSettingsHero() {
    return (
        <header className="space-y-4 rounded-3xl border bg-card p-6 shadow-sm md:p-10">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold tracking-tight md:text-4xl">
                    App Settings
                </h1>
                <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
                    View and update global runtime settings used by CPF collection flows.
                    Changes are persisted in the database and applied across the application.
                </p>
            </div>
        </header>
    );
}

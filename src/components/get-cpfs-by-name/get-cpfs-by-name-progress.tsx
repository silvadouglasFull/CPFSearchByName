import { PageStatus } from '@/components/get-cpfs-by-name/types';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface GetCpfsByNameProgressProps {
    pageStatuses: PageStatus[];
    totalPages: number;
}

export function GetCpfsByNameProgress({ pageStatuses, totalPages }: GetCpfsByNameProgressProps) {
    return (
        <div className="rounded-3xl border bg-card p-4 shadow-sm md:p-6">
            <p className="mb-4 text-sm font-medium text-muted-foreground">Collection progress</p>

            <div className="flex flex-wrap gap-3">
                {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;
                    const status: PageStatus = pageStatuses[index] ?? { state: 'idle' };

                    return (
                        <div
                            key={page}
                            className={cn(
                                'flex min-w-[72px] flex-1 flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-center transition-colors',
                                status.state === 'idle' && 'border-border bg-muted/30 text-muted-foreground',
                                status.state === 'collecting' && 'border-primary/40 bg-primary/5 text-primary',
                                status.state === 'done' && 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
                                status.state === 'error' && 'border-destructive/30 bg-destructive/5 text-destructive',
                            )}
                        >
                            <span className="text-xs font-semibold">Page {page}</span>

                            {status.state === 'idle' && (
                                <span className="h-4 w-4 rounded-full border-2 border-current opacity-40" />
                            )}
                            {status.state === 'collecting' && (
                                <Loader2 className="size-4 animate-spin" />
                            )}
                            {status.state === 'done' && (
                                <CheckCircle2 className="size-4" />
                            )}
                            {status.state === 'error' && (
                                <AlertCircle className="size-4" />
                            )}

                            <span className="text-xs leading-tight">
                                {status.state === 'idle' && 'Waiting'}
                                {status.state === 'collecting' && 'Collecting...'}
                                {status.state === 'done' && `${status.count} record${status.count !== 1 ? 's' : ''}`}
                                {status.state === 'error' && 'Failed'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

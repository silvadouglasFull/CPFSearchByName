import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { ReactNode } from 'react';

type FriendlyMessageVariant = 'info' | 'success' | 'warning' | 'error';

interface FriendlyMessageProps {
    title: string;
    description: string;
    variant?: FriendlyMessageVariant;
    className?: string;
    action?: ReactNode;
}

const STYLE_BY_VARIANT: Record<FriendlyMessageVariant, string> = {
    info: 'border-primary/30 bg-primary/5 text-primary',
    success: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
    warning: 'border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300',
    error: 'border-destructive/50 bg-destructive/5 text-destructive',
};

function getIconByVariant(variant: FriendlyMessageVariant) {
    const iconClassName = 'mt-0.5 size-4 shrink-0';

    switch (variant) {
        case 'success':
            return <CheckCircle2 className={iconClassName} />;
        case 'warning':
            return <TriangleAlert className={iconClassName} />;
        case 'error':
            return <AlertCircle className={iconClassName} />;
        case 'info':
        default:
            return <Info className={iconClassName} />;
    }
}

export function FriendlyMessage({
    title,
    description,
    variant = 'info',
    className,
    action,
}: FriendlyMessageProps) {
    return (
        <Alert className={cn('rounded-2xl border', STYLE_BY_VARIANT[variant], className)}>
            {getIconByVariant(variant)}
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{description}</AlertDescription>
            {action ? <div className="col-start-2 mt-2">{action}</div> : null}
        </Alert>
    );
}

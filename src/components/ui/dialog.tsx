'use client';

import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { ReactNode } from 'react';

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: ReactNode;
}

interface DialogContentProps {
    children: ReactNode;
    className?: string;
}

interface DialogHeaderProps {
    children: ReactNode;
    className?: string;
}

interface DialogTitleProps {
    children: ReactNode;
    className?: string;
}

interface DialogDescriptionProps {
    children: ReactNode;
    className?: string;
}

const DialogContext = React.createContext<{ open: boolean; onOpenChange?: (open: boolean) => void }>({ open: false });

export const Dialog = ({ open = false, onOpenChange, children }: DialogProps) => {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children }, ref) => {
        const { open, onOpenChange } = React.useContext(DialogContext);

        if (!open) return null;

        return (
            <>
                <div
                    className="fixed inset-0 z-50 bg-black/80"
                    onClick={() => onOpenChange?.(false)}
                />
                <div
                    ref={ref}
                    className={cn(
                        'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border border-slate-200 bg-white p-6 shadow-lg',
                        className
                    )}
                >
                    <button
                        onClick={() => onOpenChange?.(false)}
                        className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    {children}
                </div>
            </>
        );
    }
);

DialogContent.displayName = 'DialogContent';

export const DialogHeader = ({ children, className }: DialogHeaderProps) => (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)}>
        {children}
    </div>
);

DialogHeader.displayName = 'DialogHeader';

export const DialogTitle = ({ children, className }: DialogTitleProps) => (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
        {children}
    </h2>
);

DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = ({ children, className }: DialogDescriptionProps) => (
    <p className={cn('text-sm text-slate-500 mb-4', className)}>
        {children}
    </p>
);

DialogDescription.displayName = 'DialogDescription';

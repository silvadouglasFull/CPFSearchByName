'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { HubDoCpfForm } from './hubdo-cpf-lookup-form';

type HubdoCpfLookupModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialCpf?: string;
    onLookupSuccess?: () => void;
};

export function HubdoCpfLookupModal({
    open,
    onOpenChange,
    initialCpf,
    onLookupSuccess,
}: HubdoCpfLookupModalProps) {
    return (
        <Dialog onOpenChange={onOpenChange} open={open}>
            <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-6">
                <DialogHeader>
                    <DialogTitle>HubDo CPF Lookup</DialogTitle>
                    <DialogDescription>
                        Submit a CPF lookup and review results without leaving the current screen.
                    </DialogDescription>
                </DialogHeader>

                <HubDoCpfForm
                    initialCpf={initialCpf}
                    onLookupSuccess={() => {
                        onLookupSuccess?.();
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}

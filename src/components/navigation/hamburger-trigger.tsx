'use client';

import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface HamburgerTriggerProps {
    isOpen: boolean;
    onToggle(): void;
}

export function HamburgerTrigger({ isOpen, onToggle }: HamburgerTriggerProps) {
    return (
        <Button
            aria-controls="mobile-sidebar"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="rounded-2xl"
            onClick={onToggle}
            size="icon"
            type="button"
            variant="outline"
        >
            {isOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </Button>
    );
}

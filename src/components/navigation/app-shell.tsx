'use client';

import { HamburgerTrigger } from '@/components/navigation/hamburger-trigger';
import { Sidebar } from '@/components/navigation/sidebar';
import { ThemeSwitcher } from '@/components/navigation/theme-switcher';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface AppShellProps {
    children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    function closeSidebar(): void {
        setIsSidebarOpen(false);
    }

    function toggleSidebar(): void {
        setIsSidebarOpen((previous) => !previous);
    }

    return (
        <div className="flex min-h-screen w-full items-stretch bg-linear-to-br from-background to-muted/30">
            <div className="hidden w-80 shrink-0 self-stretch md:flex">
                <Sidebar className="flex-1 rounded-none" />
            </div>

            <div className="relative flex min-w-0 flex-1 flex-col">
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur md:hidden">
                    <div className="space-y-0.5">
                        <p className="text-xs text-muted-foreground">verifyDocs</p>
                        <p className="text-sm font-semibold tracking-tight">Navigation</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeSwitcher />
                        <HamburgerTrigger isOpen={isSidebarOpen} onToggle={toggleSidebar} />
                    </div>
                </header>

                <div
                    className={cn(
                        'fixed inset-0 z-40 bg-black/45 transition-opacity md:hidden',
                        isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
                    )}
                    onClick={closeSidebar}
                />

                <div
                    className={cn(
                        'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] transition-transform md:hidden',
                        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
                    )}
                    id="mobile-sidebar"
                >
                    <Sidebar className="min-h-full rounded-none" onNavigate={closeSidebar} />
                </div>

                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
}

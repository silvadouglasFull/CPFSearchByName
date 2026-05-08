'use client';

import { NAVIGATION_LINKS } from '@/components/navigation/navigation-links';
import { ThemeSwitcher } from '@/components/navigation/theme-switcher';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileText, Mail, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LEGAL_LINKS = [
    {
        href: '/privacy-policy',
        icon: Shield,
        label: 'Privacy Policy',
    },
    {
        href: '/terms-of-use',
        icon: FileText,
        label: 'Terms of Use',
    },
    {
        href: '/contact',
        icon: Mail,
        label: 'Contact',
    },
] as const;

interface SidebarProps {
    className?: string;
    onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn('flex min-h-full w-full flex-col rounded-none border-r bg-card', className)}>
            <div className="space-y-3 border-b px-4 py-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Navigation</p>
                        <h1 className="text-base font-semibold tracking-tight">CPF Search</h1>
                    </div>
                    <Badge className="rounded-full" variant="secondary">
                        v1
                    </Badge>
                </div>

                <div>
                    <p className="mb-2 text-xs text-muted-foreground">Theme</p>
                    <ThemeSwitcher className="w-full justify-center" />
                </div>
            </div>

            <nav className="flex-1 space-y-2 p-3" role="navigation">
                {NAVIGATION_LINKS.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;

                    return (
                        <Link
                            className={cn(
                                'flex rounded-2xl border px-3 py-3 transition-colors',
                                'focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-2',
                                isActive
                                    ? 'border-primary/30 bg-primary/10 text-primary'
                                    : 'border-transparent hover:border-border hover:bg-muted/60',
                            )}
                            href={link.href}
                            key={link.href}
                            onClick={onNavigate}
                        >
                            <Icon className="mt-0.5 mr-3 size-4 shrink-0" />
                            <span className="space-y-1">
                                <span className="block text-sm font-medium">{link.label}</span>
                                <span className="block text-xs text-muted-foreground">{link.description}</span>
                            </span>
                        </Link>
                    );
                })}

                <div className="mt-6 border-t pt-4">
                    <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Legal
                    </p>

                    <div className="space-y-2">
                        {LEGAL_LINKS.map((link) => {
                            const isActive = pathname === link.href;
                            const Icon = link.icon;

                            return (
                                <Link
                                    className={cn(
                                        'flex items-center rounded-2xl border px-3 py-3 text-sm transition-colors',
                                        'focus-visible:ring-ring/60 focus-visible:outline-none focus-visible:ring-2',
                                        isActive
                                            ? 'border-primary/30 bg-primary/10 text-primary'
                                            : 'border-transparent hover:border-border hover:bg-muted/60',
                                    )}
                                    href={link.href}
                                    key={link.href}
                                    onClick={onNavigate}
                                >
                                    <Icon className="mr-3 size-4 shrink-0" />
                                    <span>{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>
        </aside>
    );
}

'use client';

import { buttonVariants } from '@/components/ui/button';
import type { ThemePreference } from '@/lib/theme/theme';
import { useTheme } from '@/lib/theme/theme-provider';
import { cn } from '@/lib/utils';
import { ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const THEME_OPTIONS = [
    {
        icon: Sun,
        label: 'Light',
        value: 'light',
    },
    {
        icon: Moon,
        label: 'Dark',
        value: 'dark',
    },
    {
        icon: Monitor,
        label: 'System',
        value: 'system',
    },
] as const;

interface ThemeSwitcherProps {
    className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const activeThemeOption = mounted
        ? (THEME_OPTIONS.find((option) => option.value === theme) ?? THEME_OPTIONS[2])
        : THEME_OPTIONS[2]; // 'system'/Monitor — matches server default
    const ActiveIcon = activeThemeOption.icon;

    return (
        <div className={cn('relative inline-flex items-center', className)}>
            <ActiveIcon className="pointer-events-none absolute left-2.5 z-10 size-3.5 text-muted-foreground" />
            <select
                aria-label="Select theme"
                className={cn(
                    buttonVariants({ size: 'sm', variant: 'outline' }),
                    'h-8 min-w-[5.5rem] appearance-none rounded-xl pl-8 pr-8 text-xs md:min-w-28 md:text-sm',
                )}
                onChange={(event) => setTheme(event.target.value as ThemePreference)}
                value={mounted ? theme : 'system'}
            >
                {THEME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 size-3.5 text-muted-foreground" />
        </div>
    );
}
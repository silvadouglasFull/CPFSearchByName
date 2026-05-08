'use client';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/lib/theme/theme-provider';
import { cn } from '@/lib/utils';
import { Monitor, Moon, Sun } from 'lucide-react';

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

    return (
        <div className={cn('inline-flex items-center rounded-2xl border bg-background p-1', className)} role="group">
            {THEME_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                    <Button
                        aria-label={`Use ${option.label.toLowerCase()} theme`}
                        className="rounded-xl"
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        size="sm"
                        type="button"
                        variant={theme === option.value ? 'secondary' : 'ghost'}
                    >
                        <Icon className="size-3.5" />
                        {option.label}
                    </Button>
                );
            })}
        </div>
    );
}
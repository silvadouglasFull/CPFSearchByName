'use client';

import {
    parseThemePreference,
    resolveEffectiveTheme,
    THEME_STORAGE_KEY,
    type ThemePreference,
} from '@/lib/theme/theme';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

interface ThemeContextValue {
    effectiveTheme: 'light' | 'dark';
    theme: ThemePreference;
    setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPrefersDark(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    if (typeof window.matchMedia !== 'function') {
        return false;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeToDom(effectiveTheme: 'light' | 'dark'): void {
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
}

function getInitialThemePreference(): ThemePreference {
    if (typeof window === 'undefined') {
        return 'system';
    }

    return parseThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<ThemePreference>(getInitialThemePreference);
    const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(getSystemPrefersDark);

    const effectiveTheme = useMemo(
        () => resolveEffectiveTheme(theme, systemPrefersDark),
        [theme, systemPrefersDark],
    );

    useEffect(() => {
        if (theme === 'system') {
            window.localStorage.removeItem(THEME_STORAGE_KEY);
        } else {
            window.localStorage.setItem(THEME_STORAGE_KEY, theme);
        }

        applyThemeToDom(effectiveTheme);
    }, [effectiveTheme, theme]);

    useEffect(() => {
        if (typeof window.matchMedia !== 'function') {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (event: MediaQueryListEvent) => {
            setSystemPrefersDark(event.matches);
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, []);

    const contextValue = useMemo(
        () => ({
            effectiveTheme,
            theme,
            setTheme,
        }),
        [effectiveTheme, theme],
    );

    return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);

    if (context === null) {
        throw new Error('useTheme must be used within ThemeProvider');
    }

    return context;
}
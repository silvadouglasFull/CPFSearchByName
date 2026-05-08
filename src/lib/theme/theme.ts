export const THEME_STORAGE_KEY = 'theme';

export type ThemePreference = 'light' | 'dark' | 'system';
export type EffectiveTheme = 'light' | 'dark';

const VALID_THEME_PREFERENCES = new Set<ThemePreference>(['light', 'dark', 'system']);

export function isThemePreference(value: string | null): value is ThemePreference {
    if (value === null) {
        return false;
    }

    return VALID_THEME_PREFERENCES.has(value as ThemePreference);
}

export function resolveEffectiveTheme(
    preference: ThemePreference,
    systemPrefersDark: boolean,
): EffectiveTheme {
    if (preference === 'light') {
        return 'light';
    }

    if (preference === 'dark') {
        return 'dark';
    }

    return systemPrefersDark ? 'dark' : 'light';
}

export function parseThemePreference(value: string | null): ThemePreference {
    if (!isThemePreference(value)) {
        return 'system';
    }

    return value;
}

export function getThemeBootstrapScript(): string {
    return `
(() => {
  try {
    const root = document.documentElement;
    const rawPreference = localStorage.getItem('${THEME_STORAGE_KEY}');
    const preference = rawPreference === 'light' || rawPreference === 'dark' || rawPreference === 'system'
      ? rawPreference
      : 'system';

    const systemPrefersDark =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldUseDark = preference === 'dark' || (preference === 'system' && systemPrefersDark);
    root.classList.toggle('dark', shouldUseDark);
  } catch {
    // Keep default light theme if browser APIs are unavailable.
  }
})();`;
}
/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useRemotePrefs } from '@/hooks/use-remote-prefs';
import { resolveTheme } from '@/lib/preference/preference';
import { THEME_STORAGE_KEY } from '@/lib/theme/theme-script';
import { type Scheme, type Theme } from '@/lib/theme/themes';

export { THEMES, type Theme } from '@/lib/theme/themes';

interface ThemeContextValue {
  /** what shows as the choice: the owner's force, else the visitor's choice, else the owner's default; `system` follows the operating system */
  theme: Theme;
  /** what is showing right now */
  resolved: Scheme;
  /** a choice of the visitor; it does nothing while a theme is forced or for one that the owner has left out */
  setTheme: (theme: Theme) => void;
  /** the themes the menu offers */
  options: Theme[];
  /** there is nothing to choose: the menus do not show */
  locked: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const systemPrefersDark = (): boolean =>
  window.matchMedia('(prefers-color-scheme: dark)').matches;

/**
 * The visitor's colour theme. The first render says `system` so the static HTML and the client agree; the real choice and what the owner said
 * (`site/live`) are read right after hydration. The `dark` class itself is put on <html> by the script in the layout before the first paint,
 * and kept in step here when the choice, what the owner said or the system setting changes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { prefs, known } = useRemotePrefs();
  const remote = prefs.theme;
  const [saved, setSaved] = useState<string | null>(null);
  // `?theme=`, read once: it is used for this visit (the head script did too) and kept as a choice once the owner's word is known
  const [url, setUrl] = useState<string | null>(null);
  const [systemDark, setSystemDark] = useState(false);
  // until the saved choice has been read the class the layout script put on <html> is left alone
  const [read, setRead] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // storage blocked: follow the system
    }
    /* eslint-disable react-hooks/set-state-in-effect -- reading the saved choice must wait for the browser */
    setSaved(stored);
    try {
      setUrl(new URLSearchParams(window.location.search).get('theme'));
    } catch {
      // no query string to read
    }
    setSystemDark(systemPrefersDark());
    setRead(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemDark(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const resolvedTheme = useMemo(
    () => resolveTheme({ remote, url, saved, systemDark }),
    [remote, url, saved, systemDark],
  );
  const { value: theme, scheme: resolved, options, locked } = resolvedTheme;

  useEffect(() => {
    if (!read) return;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [read, theme, resolved]);

  const allowed = useRef({ options, locked });
  useEffect(() => {
    allowed.current = { options, locked };
  });
  const keep = useCallback((next: Theme) => {
    setSaved(next === 'system' ? null : next);
    try {
      if (next === 'system') window.localStorage.removeItem(THEME_STORAGE_KEY);
      else window.localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }, []);
  const setTheme = useCallback(
    (next: Theme) => {
      if (allowed.current.locked || !allowed.current.options.includes(next))
        return;
      // a choice in the menu comes before the link the visitor came with
      setUrl(null);
      keep(next);
    },
    [keep],
  );
  // `?theme=` is kept like a choice, unless the owner forces a theme or has left a scheme out
  useEffect(() => {
    if (!known || !url || resolvedTheme.forced || resolvedTheme.value !== url)
      return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- keeping the choice of a link follows from reading the owner's word
    keep(resolvedTheme.value);
  }, [known, url, resolvedTheme.forced, resolvedTheme.value, keep]);

  const value = useMemo(
    () => ({ theme, resolved, setTheme, options, locked }),
    [theme, resolved, setTheme, options, locked],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside <ThemeProvider>');
  return value;
}

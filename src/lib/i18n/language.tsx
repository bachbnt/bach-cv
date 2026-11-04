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
  useState,
  type ReactNode,
} from 'react';
import { LANGS, type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';

const STORAGE_KEY = 'bach-cv-lang';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const isLang = (value: unknown): value is Lang => LANGS.includes(value as Lang);

/**
 * The visitor's language: what they chose last time, else their browser's language if the site has it,
 * else the site default. The first render always uses the default so the static HTML and the client agree.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(shell.defaultLanguage);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage blocked: fall through to the browser language
    }
    const browser = navigator.language.slice(0, 2);
    const next = [saved, browser].find(
      (c) => isLang(c) && shell.languages.includes(c),
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved choice must wait for the browser
    if (isLang(next)) setLangState(next);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang(): LanguageContextValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLang must be used inside <LanguageProvider>');
  return value;
}

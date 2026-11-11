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
import { type Lang } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { keepOf, resolvePreference } from '@/lib/preference/preference';

const STORAGE_KEY = 'bach-cv-lang';

interface LanguageContextValue {
  /** the language that shows: the owner's force, else `?lang=` or what the visitor chose, else the owner's default, else the browser's, else the site's */
  lang: Lang;
  /** a choice of the visitor; it does nothing while a language is forced or for one that the owner has left out */
  setLang: (lang: Lang) => void;
  /** the languages the menu offers: the languages of the site but the ones the owner has left out */
  options: Lang[];
  /** there is nothing to choose: the menus do not show */
  locked: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** What this browser says of the visitor, read once after hydration. */
interface Hints {
  saved: string | null;
  url: string | null;
  browser: string | null;
}
const NO_HINTS: Hints = { saved: null, url: null, browser: null };

/**
 * The visitor's language, by the order of `lib/preference/preference.ts`: what the owner forces, `?lang=` and what they chose last time, what
 * the owner set as the default, their browser's language if the site has it, else the site default. The first render always uses the default
 * so the static HTML and the client agree.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const { prefs, known } = useRemotePrefs();
  const remote = prefs.language;
  const [hints, setHints] = useState<Hints>(NO_HINTS);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage blocked: fall through to the browser language
    }
    let url: string | null = null;
    try {
      url = new URLSearchParams(window.location.search).get('lang');
    } catch {
      // no query string to read
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading the saved choice must wait for the browser
    setHints({ saved, url, browser: navigator.language.slice(0, 2) });
  }, []);

  const resolved = useMemo(
    () =>
      resolvePreference<Lang>({
        all: shell.languages,
        keep: keepOf(shell.languages, shell.defaultLanguage, remote.off),
        remote,
        url: hints.url,
        saved: hints.saved,
        fallbacks: [hints.browser],
      }),
    [remote, hints],
  );
  const { value: lang, options, locked } = resolved;

  // `?lang=` is kept like a choice (a link can send a visitor to a language), unless the owner forces one
  useEffect(() => {
    if (!known || !hints.url || resolved.forced || resolved.value !== hints.url)
      return;
    try {
      window.localStorage.setItem(STORAGE_KEY, hints.url);
    } catch {
      // storage blocked: it lasts until the page closes
    }
  }, [known, hints.url, resolved.forced, resolved.value]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const allowed = useRef({ options, locked });
  useEffect(() => {
    allowed.current = { options, locked };
  });
  const setLang = useCallback((next: Lang) => {
    if (allowed.current.locked || !allowed.current.options.includes(next))
      return;
    // the choice goes before `?lang=`: a visitor who asked for another language in the menu is not sent back by the link they came with
    setHints((old) => ({ ...old, saved: next, url: null }));
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked: the choice lasts until the page closes
    }
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, options, locked }),
    [lang, setLang, options, locked],
  );
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

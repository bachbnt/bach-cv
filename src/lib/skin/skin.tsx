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
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useRemotePrefs } from '@/hooks/use-remote-prefs';
import { resolvePreference } from '@/lib/preference/preference';
import {
  DEFAULT_SKIN,
  SKIN_IDS,
  SKIN_STORAGE_KEY,
  type SkinId,
} from '@/lib/skin/skins';

interface SkinContextValue {
  /** the skin that shows: the owner's force, else the visitor's choice, else the owner's default (see `lib/preference/preference.ts`) */
  skin: SkinId;
  /** a choice of the visitor; it does nothing while a skin is forced or for a skin that the owner has left out */
  setSkin: (skin: SkinId) => void;
  /** the skins the menu offers: all of them but the ones the owner has left out */
  options: SkinId[];
  /** there is nothing to choose (a skin is forced, or only one is left): the menus do not show */
  locked: boolean;
  /** the visitor's choice and what the owner said have been read: before that `skin` is only the default of the static HTML */
  settled: boolean;
}

const SkinContext = createContext<SkinContextValue | null>(null);

const listeners = new Set<() => void>();
// where the choice lives only while the browser's storage is blocked, so a change made in another tab is not shadowed
let memory: SkinId | null = null;

function read(): string | null {
  if (memory) return memory;
  try {
    return window.localStorage.getItem(SKIN_STORAGE_KEY);
  } catch {
    // storage blocked: no choice
    return null;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // another tab or window changed it
  const onStorage = (event: StorageEvent) => {
    if (event.key === SKIN_STORAGE_KEY) listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/**
 * The visitor's skin. The first render is the default skin so it matches the static HTML; the saved choice and what the owner said
 * (`site/live`, kept from the last visit until it is read again) are read right after hydration, and <SkinFrame> shows the skin once its
 * code has loaded.
 */
export function SkinProvider({ children }: { children: ReactNode }) {
  const { prefs, known } = useRemotePrefs();
  const remote = prefs.skin;
  const saved = useSyncExternalStore(subscribe, read, () => null);
  const [settled, setSettled] = useState(false);
  // `?skin=`, read once: it is used for this visit (the head script did too) and kept as a choice once the owner's word is known
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- reading the saved choice must wait for the browser */
    try {
      setUrl(new URLSearchParams(window.location.search).get('skin'));
    } catch {
      // no query string to read
    }
    setSettled(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  const resolved = useMemo(
    () =>
      resolvePreference({
        all: SKIN_IDS,
        keep: DEFAULT_SKIN,
        remote,
        url,
        saved,
      }),
    [remote, url, saved],
  );
  const { value: skin, options, locked } = resolved;
  const allowed = useRef({ options, locked });
  useEffect(() => {
    allowed.current = { options, locked };
  });
  const keep = useCallback((next: SkinId) => {
    try {
      window.localStorage.setItem(SKIN_STORAGE_KEY, next);
      memory = null;
    } catch {
      // storage blocked: the choice lasts until the page closes
      memory = next;
    }
    listeners.forEach((listener) => listener());
  }, []);
  const setSkin = useCallback(
    (next: SkinId) => {
      if (allowed.current.locked || !allowed.current.options.includes(next))
        return;
      // a choice in the menu comes before the link the visitor came with
      setUrl(null);
      keep(next);
    },
    [keep],
  );
  // `?skin=` is kept like a choice, unless the owner forces a skin or has left that one out
  useEffect(() => {
    if (!known || !url || resolved.forced || resolved.value !== url) return;
    keep(resolved.value);
  }, [known, url, resolved.forced, resolved.value, keep]);
  const value = useMemo(
    () => ({ skin, setSkin, options, locked, settled }),
    [skin, setSkin, options, locked, settled],
  );
  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

export function useSkin(): SkinContextValue {
  const value = useContext(SkinContext);
  if (!value) throw new Error('useSkin must be used inside <SkinProvider>');
  return value;
}

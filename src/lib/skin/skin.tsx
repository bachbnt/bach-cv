/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import {
  DEFAULT_SKIN,
  isSkinId,
  SKIN_STORAGE_KEY,
  type SkinId,
} from '@/lib/skin/skins';

interface SkinContextValue {
  /** the skin the visitor chose */
  skin: SkinId;
  setSkin: (skin: SkinId) => void;
}

const SkinContext = createContext<SkinContextValue | null>(null);

const listeners = new Set<() => void>();
// where the choice lives only while the browser's storage is blocked, so a change made in another tab is not shadowed
let memory: SkinId | null = null;

function read(): SkinId {
  if (memory) return memory;
  try {
    const saved = window.localStorage.getItem(SKIN_STORAGE_KEY);
    if (isSkinId(saved)) return saved;
  } catch {
    // storage blocked: the default skin
  }
  return DEFAULT_SKIN;
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
 * The visitor's skin. The first render is the default skin so it matches the static HTML; the saved choice is read right after
 * hydration (`useSyncExternalStore`), and <SkinFrame> shows it once its code has loaded.
 */
export function SkinProvider({ children }: { children: ReactNode }) {
  const skin = useSyncExternalStore(subscribe, read, () => DEFAULT_SKIN);
  const setSkin = useCallback((next: SkinId) => {
    try {
      window.localStorage.setItem(SKIN_STORAGE_KEY, next);
      memory = null;
    } catch {
      // storage blocked: the choice lasts until the page closes
      memory = next;
    }
    listeners.forEach((listener) => listener());
  }, []);
  const value = useMemo(() => ({ skin, setSkin }), [skin, setSkin]);
  return <SkinContext.Provider value={value}>{children}</SkinContext.Provider>;
}

export function useSkin(): SkinContextValue {
  const value = useContext(SkinContext);
  if (!value) throw new Error('useSkin must be used inside <SkinProvider>');
  return value;
}

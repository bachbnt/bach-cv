/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Layout } from '@/skins/trade/blocks/shell-layout';
import { useLayoutState } from '@/skins/trade/shell/use-layout';

/** How many picks the search remembers. */
const RECENT_LIMIT = 5;

interface TradeContextValue {
  /** the CV window */
  cvOpen: boolean;
  openCv: () => void;
  closeCv: () => void;
  /** the job a flag of the chart asked for: the Resume page opens its responsibilities and scrolls to it */
  jobId: string | null;
  /** how many times a job was asked for: it goes up on EVERY ask, so asking for the same job again (after the visitor scrolled away) scrolls again */
  jobAsk: number;
  showJob: (id: string) => void;
  /** the degree a flag of the chart asked for: the Resume page scrolls to its row once, then `doneDegree` clears the ask (a later visit to Resume does not scroll again) */
  degreeAsk: { id: string; n: number } | null;
  showDegree: (id: string) => void;
  doneDegree: () => void;
  /** the symbol search (Ctrl or Cmd with K, or "/") */
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  /** where the focus goes back to when the search closes: what had it when the search opened */
  searchReturnFocus: () => HTMLElement | null;
  /** the ids of what the visitor picked in the search, newest first; kept for as long as the terminal is open, never stored */
  recents: string[];
  remember: (id: string) => void;
  /** which parts of the terminal show (saved in the browser) */
  layout: Layout;
  setLayout: (patch: Partial<Layout>) => void;
  /** the place in the right column that the BB Bot panel draws in while it is open (the shell sets it) */
  dock: HTMLElement | null;
  setDock: (element: HTMLElement | null) => void;
}

const TradeContext = createContext<TradeContextValue | null>(null);

/** What the parts of the Trade terminal share: the CV window, the job a flag of the chart points at, the search and the layout. */
export function TradeProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [cvOpen, setCvOpen] = useState(false);
  const [asked, setAsked] = useState<{ id: string; n: number } | null>(null);
  const [degreeAsk, setDegreeAsk] = useState<{ id: string; n: number } | null>(
    null,
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [recents, setRecents] = useState<string[]>([]);
  const [dock, setDock] = useState<HTMLElement | null>(null);
  const { layout, update } = useLayoutState();

  // a flag asks for a row of Resume: the page panel must be on screen for the row to be anywhere (it is off when the visitor turned it off in
  // Layout, and when Resume is already the page there is no page change that would bring it back)
  const showJob = useCallback(
    (id: string) => {
      update({ panel: true });
      setAsked((old) => ({ id, n: (old?.n ?? 0) + 1 }));
      router.push('/resume');
    },
    [router, update],
  );
  const showDegree = useCallback(
    (id: string) => {
      update({ panel: true });
      setDegreeAsk((old) => ({ id, n: (old?.n ?? 0) + 1 }));
      router.push('/resume');
    },
    [router, update],
  );
  const doneDegree = useCallback(() => setDegreeAsk(null), []);
  const searchReturn = useRef<HTMLElement | null>(null);
  const openSearch = useCallback(() => {
    searchReturn.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setSearchOpen(true);
  }, []);
  const searchReturnFocus = useCallback(() => searchReturn.current, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const remember = useCallback(
    (id: string) =>
      setRecents((list) =>
        [id, ...list.filter((item) => item !== id)].slice(0, RECENT_LIMIT),
      ),
    [],
  );

  const value = useMemo<TradeContextValue>(
    () => ({
      cvOpen,
      openCv: () => setCvOpen(true),
      closeCv: () => setCvOpen(false),
      jobId: asked?.id ?? null,
      jobAsk: asked?.n ?? 0,
      showJob,
      degreeAsk,
      showDegree,
      doneDegree,
      searchOpen,
      openSearch,
      closeSearch,
      searchReturnFocus,
      recents,
      remember,
      layout,
      setLayout: update,
      dock,
      setDock,
    }),
    [
      cvOpen,
      asked,
      showJob,
      degreeAsk,
      showDegree,
      doneDegree,
      searchOpen,
      openSearch,
      closeSearch,
      searchReturnFocus,
      recents,
      remember,
      layout,
      update,
      dock,
    ],
  );
  return (
    <TradeContext.Provider value={value}>{children}</TradeContext.Provider>
  );
}

export function useTrade(): TradeContextValue {
  const value = useContext(TradeContext);
  if (!value) throw new Error('useTrade must be used inside <TradeProvider>');
  return value;
}

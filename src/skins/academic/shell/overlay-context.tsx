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

/** One picture of the viewer: a project screenshot, a certificate or a payment QR code. */
export interface ViewerItem {
  src: string;
  /** the name above the picture (`VenusAI`, `BIDV QR code`) */
  title: string;
  /** a short line under the picture (`Freelance · screenshot 2 of 8`) */
  subtitle?: string;
  /** the text alternative of the picture */
  caption: string;
  /** actions under the picture that open a link (`Website`, `Open PDF`) */
  links?: { label: string; url: string }[];
  /** the accessible names of the close and step buttons, when the Standard words differ from the default ("Close screenshots") */
  labels?: { close: string; previous: string; next: string };
  /** an action that copies a text (`Copy number`) and says `done` in the toast when it has */
  copy?: { text: string; label: string; done: string };
  /** an action that saves the picture (`Save QR`); it says what happened in the toast itself and falls back to opening the picture in a new tab */
  save?: { label: string; run: () => void | Promise<void> };
}

interface OverlayContextValue {
  /** the viewer: the pictures it steps through and the one on show, or `null` when closed */
  viewer: { items: ViewerItem[]; index: number } | null;
  openViewer: (items: ViewerItem[], index?: number) => void;
  setViewerIndex: (index: number) => void;
  closeViewer: () => void;
  /** the CV sheet */
  cvOpen: boolean;
  openCv: () => void;
  closeCv: () => void;
  /** a short message on a paper slip at the foot of the board (`Number copied`); a repeated message is announced again */
  say: (message: string) => void;
  toast: { message: string; visible: boolean };
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

const TOAST_MS = 2000;

/** What the pages of the Academic skin share to open things above the page: the viewer, the CV sheet and the toast. */
export function AcOverlayProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<OverlayContextValue['viewer']>(null);
  const [cvOpen, setCvOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const nudge = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(nudge.current);
    },
    [],
  );

  const say = useCallback((message: string) => {
    clearTimeout(timer.current);
    clearTimeout(nudge.current);
    // the text is cleared first so that the same message twice is read out twice
    setToast({ message: '', visible: false });
    nudge.current = setTimeout(() => {
      setToast({ message, visible: true });
      timer.current = setTimeout(
        () => setToast((t) => ({ ...t, visible: false })),
        TOAST_MS,
      );
    }, 20);
  }, []);

  const value = useMemo<OverlayContextValue>(
    () => ({
      viewer,
      openViewer: (items, index = 0) => setViewer({ items, index }),
      setViewerIndex: (index) => setViewer((v) => (v ? { ...v, index } : v)),
      closeViewer: () => setViewer(null),
      cvOpen,
      openCv: () => setCvOpen(true),
      closeCv: () => setCvOpen(false),
      say,
      toast,
    }),
    [viewer, cvOpen, say, toast],
  );

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
}

export function useAcOverlays(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value) {
    throw new Error('useAcOverlays must be used inside <AcOverlayProvider>');
  }
  return value;
}

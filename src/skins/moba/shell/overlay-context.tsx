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

/** One picture of the picture viewer (a project screenshot, a certificate, a payment QR code). */
export interface ViewerItem {
  src: string;
  /** the name in the title of the window (`VenusAI`, `BIDV QR code`) */
  title: string;
  /** a short line after the title (`Freelance · screenshot 2 of 8`) */
  subtitle?: string;
  /** the text alternative of the picture */
  alt: string;
  /** what is written under the picture (chips, an account name and number) */
  meta?: ReactNode;
  /** the buttons and links under the picture, before the step buttons */
  actions?: ReactNode;
  /** a QR code or a document needs white around it */
  matted?: boolean;
  /** the accessible names of the close and step buttons, when the Standard words differ from the default ("Close screenshots") */
  labels?: { close: string; previous: string; next: string };
  /** the accessible name of the thumbnail of this picture */
  thumbnailLabel?: string;
}

interface OverlayContextValue {
  viewer: { items: ViewerItem[]; index: number } | null;
  openViewer: (items: ViewerItem[], index?: number) => void;
  setViewerIndex: (index: number) => void;
  closeViewer: () => void;
  cvOpen: boolean;
  openCv: () => void;
  closeCv: () => void;
  keysOpen: boolean;
  setKeysOpen: (open: boolean) => void;
  connectOpen: boolean;
  setConnectOpen: (open: boolean) => void;
  /** a short message at the foot of the window (`Copied`); the same message twice is announced twice */
  say: (message: string) => void;
  toast: { message: string; visible: boolean };
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

const TOAST_MS = 2200;

/** What the pages and the HUD share to open things above them: the picture viewer, the CV window, the key list and the toast. */
export function OverlayProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<OverlayContextValue['viewer']>(null);
  const [cvOpen, setCvOpen] = useState(false);
  const [keysOpen, setKeysOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
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
      keysOpen,
      setKeysOpen,
      connectOpen,
      setConnectOpen,
      say,
      toast,
    }),
    [viewer, cvOpen, keysOpen, connectOpen, say, toast],
  );

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
}

export function useOverlays(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value)
    throw new Error('useOverlays must be used inside <OverlayProvider>');
  return value;
}

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
import type { TagTone } from '@/components/tag';
import { emit } from '@/skins/dev/shell/devlog/store';

/** A chip under a picture. */
export interface ViewerTag {
  label: string;
  tone?: TagTone;
  /** a kind of the thing (`Bank`), shown as the pill of the kinds in the page, not as a technology chip */
  pill?: boolean;
}

/** One picture of the picture viewer (a project screenshot, a certificate, a payment QR code). */
export interface ViewerItem {
  src: string;
  /** the name in the window title (`VenusAI`, `BIDV QR code`) */
  title: string;
  /** a short line after the title (`Freelance · screenshot 2 of 8`) */
  subtitle?: string;
  /** the text alternative of the picture */
  caption: string;
  /** technologies or kinds, shown as chips under the picture; a technology has the colour of its skill category */
  tags?: ViewerTag[];
  /** actions under the picture that open a link (`Website`, `Open PDF`) */
  links?: { label: string; url: string }[];
  /** the accessible names of the close and step buttons, when the Standard words differ from the default ("Close screenshots") */
  labels?: { close: string; previous: string; next: string };
  /** an action that copies a text (`Copy number`) and says `done` in the toast when it has */
  copy?: { text: string; label: string; done: string };
}

interface OverlayContextValue {
  /** the picture viewer: the pictures it steps through and the one on show, or `null` when closed */
  viewer: { items: ViewerItem[]; index: number } | null;
  openViewer: (items: ViewerItem[], index?: number) => void;
  setViewerIndex: (index: number) => void;
  closeViewer: () => void;
  /** the CV window */
  cvOpen: boolean;
  openCv: () => void;
  closeCv: () => void;
  /** a short message at the bottom of the window (`Number copied`); a repeated message is announced again */
  say: (message: string) => void;
  toast: { message: string; visible: boolean };
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

const TOAST_MS = 2000;

/** What the pages of the Dev skin share to open things above the page: the picture viewer, the CV window and the toast. */
export function DevOverlayProvider({ children }: { children: ReactNode }) {
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
      openViewer: (items, index = 0) => {
        emit({ kind: 'ui', action: 'viewer opened' });
        setViewer({ items, index });
      },
      setViewerIndex: (index) => setViewer((v) => (v ? { ...v, index } : v)),
      closeViewer: () => setViewer(null),
      cvOpen,
      openCv: () => {
        emit({ kind: 'ui', action: 'cv opened' });
        setCvOpen(true);
      },
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

export function useDevOverlays(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value) {
    throw new Error('useDevOverlays must be used inside <DevOverlayProvider>');
  }
  return value;
}

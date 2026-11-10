/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { TagTone } from '@/components/tag';
import { emit } from '@/skins/dev/shell/devlog/store';
import { useToast, type ToastState } from '@/hooks/use-toast';

/** A chip under a picture. */
interface ViewerTag {
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
}

const OverlayContext = createContext<OverlayContextValue | null>(null);
/** The toast has a context of its own: it changes three times at every `say`, and only the toast itself needs to follow it. */
const ToastContext = createContext<ToastState>({ message: '', visible: false });

/** What the pages of the Dev skin share to open things above the page: the picture viewer, the CV window and the toast. */
export function DevOverlayProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<OverlayContextValue['viewer']>(null);
  const [cvOpen, setCvOpen] = useState(false);
  const { toast, say } = useToast();

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
    }),
    [viewer, cvOpen, say],
  );

  return (
    <OverlayContext.Provider value={value}>
      <ToastContext.Provider value={toast}>{children}</ToastContext.Provider>
    </OverlayContext.Provider>
  );
}

export function useDevOverlays(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value) {
    throw new Error('useDevOverlays must be used inside <DevOverlayProvider>');
  }
  return value;
}

/** The toast at the bottom of the window: its text and whether it shows. */
export function useDevToast(): ToastState {
  return useContext(ToastContext);
}

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
import { useToast } from '@/hooks/use-toast';

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
  /** the Connect sheet (the email and the links) */
  connectOpen: boolean;
  openConnect: () => void;
  closeConnect: () => void;
  /** the Settings sheet (language, skin, theme and the actions of the dock) */
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  /** a short message that rises above the home bar (`Number copied`); a repeated message is announced again */
  say: (message: string) => void;
  toast: { message: string; visible: boolean };
}

const OverlayContext = createContext<OverlayContextValue | null>(null);

/** What the pages of the Phone skin share to open things above the page: the viewer, the sheets and the toast. */
export function PhOverlayProvider({ children }: { children: ReactNode }) {
  const [viewer, setViewer] = useState<OverlayContextValue['viewer']>(null);
  const [cvOpen, setCvOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast, say } = useToast();

  const value = useMemo<OverlayContextValue>(
    () => ({
      viewer,
      openViewer: (items, index = 0) => setViewer({ items, index }),
      setViewerIndex: (index) => setViewer((v) => (v ? { ...v, index } : v)),
      closeViewer: () => setViewer(null),
      cvOpen,
      openCv: () => setCvOpen(true),
      closeCv: () => setCvOpen(false),
      connectOpen,
      openConnect: () => setConnectOpen(true),
      closeConnect: () => setConnectOpen(false),
      settingsOpen,
      openSettings: () => setSettingsOpen(true),
      closeSettings: () => setSettingsOpen(false),
      say,
      toast,
    }),
    [viewer, cvOpen, connectOpen, settingsOpen, say, toast],
  );

  return (
    <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>
  );
}

export function usePhOverlays(): OverlayContextValue {
  const value = useContext(OverlayContext);
  if (!value) {
    throw new Error('usePhOverlays must be used inside <PhOverlayProvider>');
  }
  return value;
}

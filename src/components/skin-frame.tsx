/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ChatWidget } from '@/components/chat/chat-widget';
import { MaintenanceGate } from '@/components/maintenance-gate';
import { useMaintenance } from '@/components/use-maintenance';
import { skinsCopy } from '@/content/copy/skins';
import { useCopy } from '@/lib/i18n/copy';
import { pageOfPath } from '@/lib/pages';
import { useSkin } from '@/lib/skin/skin';
import { DEFAULT_SKIN, type SkinId } from '@/lib/skin/skins';
import { hasLoader, SKIN_LOADERS } from '@/skins/registry';
import type { SkinDefinition } from '@/skins/types';

/** How long the "could not load that skin" note stays. */
const NOTE_MS = 6000;

/**
 * Shows the skin the visitor chose: `children` (the page as Standard renders it) or the loaded skin, which replaces the page's frame
 * and content. The default look stays on screen while a skin loads; on a first visit the head script keeps the body hidden instead.
 */
export function SkinFrame({ children }: { children: ReactNode }) {
  const { skin, setSkin } = useSkin();
  const pathname = usePathname();
  const copy = useCopy(skinsCopy);
  const maintenance = useMaintenance();
  const [loaded, setLoaded] = useState<{
    id: SkinId;
    definition: SkinDefinition;
  } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasLoader(skin)) return;
    let cancelled = false;
    SKIN_LOADERS[skin]()
      .then((module) => {
        if (!cancelled) setLoaded({ id: skin, definition: module.default });
      })
      .catch(() => {
        if (cancelled) return;
        // the code could not be fetched (offline, a deploy in between): go back to the default look and say so
        setSkin(DEFAULT_SKIN);
        setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [skin, setSkin]);

  useEffect(() => {
    if (!failed) return;
    const timer = setTimeout(() => setFailed(false), NOTE_MS);
    return () => clearTimeout(timer);
  }, [failed]);

  const active = loaded && loaded.id === skin ? loaded.definition : null;

  // `data-skin` says which skin is on screen and `data-skin-ready` that it is there: the CSS hides the body between the two
  useEffect(() => {
    const html = document.documentElement;
    if (active) {
      html.setAttribute('data-skin', active.id);
      html.setAttribute('data-skin-ready', '');
    } else if (skin === DEFAULT_SKIN) {
      html.removeAttribute('data-skin');
      html.removeAttribute('data-skin-ready');
    }
  }, [active, skin]);

  const note = failed ? (
    <p
      role='status'
      className='fixed inset-x-4 bottom-4 z-[200] mx-auto w-fit max-w-[calc(100vw-32px)] rounded-xl border bg-card px-4 py-3 text-sm font-medium shadow-lg'
    >
      {copy.loadFailed}
    </p>
  ) : null;

  if (!active) {
    return (
      <>
        <MaintenanceGate>
          {children}
          {skin === DEFAULT_SKIN && <ChatWidget />}
        </MaintenanceGate>
        {note}
      </>
    );
  }
  if (maintenance.enabled) {
    return (
      <>
        <active.Maintenance
          message={maintenance.message}
          email={maintenance.email}
        />
        {note}
      </>
    );
  }
  const page = pageOfPath(pathname);
  const Page = page ? active.pages[page] : active.NotFound;
  return (
    <>
      <active.Frame page={page}>
        <Page />
      </active.Frame>
      {note}
    </>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, ViewTransition, type ReactNode } from 'react';
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
  const { skin, setSkin, settled } = useSkin();
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
    } else if (settled && (skin === DEFAULT_SKIN || failed)) {
      // the first render is always the default (it matches the static HTML), so `skin` alone cannot say that the visitor (or the owner) chose
      // another: until the choice has been read the head script's `data-skin` stays, and the body stays hidden until that skin is ready. A skin
      // that could not be loaded gives the page back as well
      html.removeAttribute('data-skin');
      html.removeAttribute('data-skin-ready');
    }
  }, [active, skin, settled, failed]);

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
          {/* a page change: the page fades out and the next one rises in, the header (named in <SitePage>) stays; the key is what makes it a change */}
          <ViewTransition
            key={pathname}
            enter='page-in'
            exit='page-out'
            default='none'
          >
            <div className='flex flex-1 flex-col'>{children}</div>
          </ViewTransition>
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

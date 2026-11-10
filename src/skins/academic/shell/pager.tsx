/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { academicCopy } from '@/content/copy/academic';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import type { PageKey } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { PAGE_META, pageOfPath } from '@/lib/pages';
import { useWipeCapture } from '@/skins/academic/shell/use-eraser-wipe';
import { usePageLabels } from '@/skins/academic/shell/use-page-labels';
import { AcIcon } from '@/skins/academic/ui/ac-icon';
import { pageNeighbours, shownPages } from '@/lib/derive/shown-pages';

/** How long a page that a key asked for stays the place the next key goes on from (a wipe and a route that has to compile take a moment). */
const ASKED_MS = 1500;

/** Keys that are typed into something never turn a page. */
const typing = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * The foot of a page: the page before and after it, where you are, and the arrow keys that turn the page (not while a window is open or
 * something is being typed).
 */
export function Pager({ page }: { page: PageKey }) {
  const copy = useCopy(academicCopy);
  const { label } = usePageLabels();
  const live = useLive();
  const router = useRouter();
  const captureWipe = useWipeCapture();
  // the page a key has already asked for: pressed again at once, the next key goes on from it (the address and the page on show are late during a wipe)
  const asked = useRef<{ page: PageKey; at: number } | null>(null);
  const shown = shownPages(live.pages);
  const { previous, next, index } = pageNeighbours(page, shown);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      if (typing(event.target) || document.querySelector('[role="dialog"]'))
        return;
      // the page asked for last, or else the one the address says (not the one on show: for a moment after a page change they differ)
      const around = pageNeighbours(
        (asked.current && Date.now() - asked.current.at < ASKED_MS
          ? asked.current.page
          : null) ??
          pageOfPath(window.location.pathname) ??
          page,
        shownPages(live.pages),
      );
      const target =
        event.key === 'ArrowRight'
          ? around.next
          : event.key === 'ArrowLeft'
            ? around.previous
            : null;
      if (target && live.pages[target] !== 'soon') {
        // the eraser needs a copy of this page before the next one is rendered
        captureWipe();
        asked.current = { page: target, at: Date.now() };
        router.push(PAGE_META[target].href);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [page, router, live.pages, captureWipe]);

  // the page asked for has arrived (or another way was taken): a key goes on from where the visitor is
  useEffect(() => {
    if (asked.current?.page === page) asked.current = null;
  }, [page]);

  const link = (key: PageKey, side: 'previous' | 'next') => (
    <Link
      href={PAGE_META[key].href}
      aria-label={fill(copy.pager[side], { page: label(key) })}
      className='inline-flex items-baseline gap-2 font-ac-note text-[19px] text-ac-link no-underline pointer-coarse:min-h-11 pointer-coarse:items-center hover:underline hover:underline-offset-[3px]'
    >
      {side === 'previous' && (
        <AcIcon name='arrowLeft' className='self-center' />
      )}
      {label(key)}
      {side === 'next' && <AcIcon name='arrowRight' className='self-center' />}
    </Link>
  );

  return (
    <footer className='mt-14 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-ac-rule pt-3.5 text-[0.9em] text-ac-mute'>
      <span>{previous && link(previous, 'previous')}</span>
      <span className='font-ac-note text-[16.5px] max-[480px]:order-last max-[480px]:basis-full max-[480px]:text-center'>
        {fill(copy.pager.position, {
          name: shell.name,
          n: index + 1,
          total: shown.length,
        })}
        <span
          aria-hidden='true'
          className='inline-flex items-center gap-1.5 text-[15px] max-[900px]:hidden'
        >
          {' · '}
          <AcIcon name='arrowLeft' className='size-[0.95em]' />
          <AcIcon name='arrowRight' className='size-[0.95em]' />
          {copy.pager.keys}
        </span>
      </span>
      <span>{next && link(next, 'next')}</span>
    </footer>
  );
}

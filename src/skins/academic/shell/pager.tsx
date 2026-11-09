/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { academicCopy } from '@/content/copy/academic';
import { commonCopy } from '@/content/copy/common';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import type { PageKey } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { PAGE_META, pageOfPath } from '@/lib/pages';
import { neighbours, shownPages } from '@/skins/academic/config';
import { useWipeCapture } from '@/skins/academic/shell/use-eraser-wipe';

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
  const common = useCopy(commonCopy);
  const copy = useCopy(academicCopy);
  const live = useLive();
  const router = useRouter();
  const captureWipe = useWipeCapture();
  const shown = shownPages(live);
  const { previous, next, index } = neighbours(page, shown);
  const label = (key: PageKey) =>
    key === 'home' ? copy.home : common.nav[key];

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
      // the page the address says, not the one on show: for a moment after a page change (the eraser is wiping) they differ
      const around = neighbours(
        pageOfPath(window.location.pathname) ?? page,
        shownPages({ pages: live.pages }),
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
        router.push(PAGE_META[target].href);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [page, router, live.pages, captureWipe]);

  const link = (key: PageKey, arrow: string, side: 'previous' | 'next') => (
    <Link
      href={PAGE_META[key].href}
      aria-label={fill(copy.pager[side], { page: label(key) })}
      className='inline-flex items-baseline gap-2 font-ac-note text-[19px] text-ac-link no-underline hover:underline hover:underline-offset-[3px]'
    >
      {side === 'previous'
        ? `${arrow} ${label(key)}`
        : `${label(key)} ${arrow}`}
    </Link>
  );

  return (
    <footer className='mt-14 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-ac-rule pt-3.5 text-[0.9em] text-ac-mute'>
      <span>{previous && link(previous, '←', 'previous')}</span>
      <span className='font-ac-note text-[16.5px]'>
        {fill(copy.pager.position, {
          name: shell.name,
          n: index + 1,
          total: shown.length,
        })}
        <span aria-hidden='true' className='text-[15px] max-[900px]:hidden'>
          {' · '}
          {copy.pager.keys}
        </span>
      </span>
      <span>{next && link(next, '→', 'next')}</span>
    </footer>
  );
}

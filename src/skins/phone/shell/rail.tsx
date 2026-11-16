/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { useLive } from '@/hooks/use-live';
import { shownPages } from '@/lib/derive/shown-pages';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PAGE_META } from '@/lib/pages';
import { cn } from '@/lib/utils';
import { PAGE_ICONS } from '@/skins/phone/config';
import { PhAction } from '@/skins/phone/shell/ph-action';
import { usePageLabels } from '@/skins/phone/shell/use-page-labels';
import { PhIconTile } from '@/skins/phone/ui/ph-icon-tile';

/**
 * The rail of a tablet (a wide screen): the apps in a column at the side of the open app, so a visitor moves between pages without going back
 * to the home screen. A page that is `soon` is a tile without a link, a hidden one is not there. It is not drawn on a phone (the home screen is).
 */
export function Rail({ page }: { page: PageKey }) {
  const common = useCopy(commonCopy);
  const { label, soon } = usePageLabels();
  const live = useLive();
  return (
    <nav
      aria-label={common.mainNav}
      className='hidden w-[88px] shrink-0 border-r border-ph-line bg-ph-sheet @min-[900px]:block'
    >
      {/* the column is as tall as the page; what is in it stays in view while the page scrolls */}
      <div className='sticky top-0 flex flex-col items-center gap-3 pt-[calc(var(--ph-bar-top)+0.75rem)] pb-4'>
        {shownPages(live.pages).map((key) => {
          const current = key === page;
          const isSoon = live.pages[key] === 'soon';
          const tile = (
            <PhIconTile
              tile={key}
              icon={PAGE_ICONS[key]}
              className={cn(
                'size-11',
                current &&
                  'ring-2 ring-ph-accent ring-offset-2 ring-offset-ph-sheet',
                !current && 'opacity-90',
              )}
            />
          );
          return isSoon ? (
            <span
              key={key}
              role='img'
              aria-label={`${label(key)} (${soon})`}
              data-ph-tip={`${label(key)} (${soon})`}
              className='ph-tip ph-tip-side inline-grid size-12 place-items-center opacity-50'
            >
              {tile}
            </span>
          ) : (
            <Link
              key={key}
              href={PAGE_META[key].href}
              aria-label={label(key)}
              data-ph-tip={label(key)}
              aria-current={current ? 'page' : undefined}
              className='ph-tip ph-tip-side group inline-grid size-12 place-items-center rounded-[30%] [corner-shape:squircle] transition-[scale] duration-100 active:scale-[0.94]'
            >
              {tile}
            </Link>
          );
        })}
        <div className='mt-auto flex flex-col items-center gap-2'>
          <PhAction kind='settings' layout='icon' className='ph-tip-side' />
        </div>
      </div>
    </nav>
  );
}

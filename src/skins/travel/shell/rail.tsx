/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { travelShellCopy } from '@/content/copy/travel-shell';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { navItems, PAGE_META } from '@/skins/travel/config';

/**
 * The menu of the trip: every page is a tab, a real link (Tab and Enter work, `aria-current` marks the page). A rail down the left on a
 * wide screen, a bar of icons along the bottom on a phone (the name stays in `aria-label`). A page switched off is absent, a `soon`
 * page carries the word.
 */
export function Rail({ page }: { page: PageKey | null }) {
  const trip = useCopy(travelShellCopy);
  const common = useCopy(commonCopy);
  const { pages } = useLive();
  return (
    <nav
      aria-label={trip.pagesLabel}
      className='tl-rail z-25 flex items-center justify-around border-tl-line bg-tl-panel max-md:order-3 max-md:border-t max-md:px-1 max-md:py-1 md:flex-col md:justify-start md:gap-1.5 md:border-r md:py-3'
    >
      {navItems(pages).map(({ page: key, soon }) => {
        const Icon = PAGE_META[key].icon;
        const label = trip.nav[key];
        return (
          <Link
            key={key}
            href={PAGE_META[key].href}
            aria-current={page === key ? 'page' : undefined}
            aria-label={soon ? `${label}, ${common.soon}` : label}
            className={cn(
              'relative flex flex-col items-center gap-0.5 rounded-2xl text-[10.5px] font-semibold text-tl-muted transition-[background-color,color,transform] max-md:size-11 max-md:justify-center md:w-[68px] md:py-2',
              'hover:bg-tl-chip hover:text-tl-chip-ink',
              'aria-[current=page]:bg-gradient-to-br aria-[current=page]:from-tl-coral aria-[current=page]:to-[color-mix(in_srgb,var(--tl-coral)_62%,#ffb44d)] aria-[current=page]:text-tl-on-coral aria-[current=page]:shadow-[0_8px_16px_-8px_var(--tl-coral)]',
            )}
          >
            <Icon aria-hidden='true' className='size-[22px] max-md:size-6' />
            <span aria-hidden='true' className='max-md:hidden'>
              {label}
            </span>
            {soon && (
              <span
                aria-hidden='true'
                className='absolute top-0.5 right-0.5 rounded-full bg-tl-coral px-1 text-[8px] font-extrabold text-white'
              >
                {common.soon}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

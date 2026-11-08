/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  ChartCandlestick,
  FileText,
  FolderKanban,
  Send,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { tradeCopy } from '@/content/copy/trade';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { navItems, PHONE_NAV, WATCH } from '@/skins/trade/config';

const ICONS: Record<(typeof PHONE_NAV)[number], LucideIcon> = {
  home: ChartCandlestick,
  projects: FolderKanban,
  resume: FileText,
  services: Send,
};

/** The four main pages as a bar at the bottom of a phone, where there is no room for the watchlist beside the chart. */
export function BottomNav({ page }: { page: PageKey | null }) {
  const copy = useCopy(tradeCopy);
  const common = useCopy(commonCopy);
  const { pages } = useLive();
  // a hidden page is absent; a page that is coming soon stays, marked and not a link, as in the Standard menu
  const items = navItems(pages).filter(({ page: item }) =>
    (PHONE_NAV as readonly PageKey[]).includes(item),
  );
  return (
    <nav
      aria-label={copy.bottomNav}
      className='fixed inset-x-0 bottom-0 z-20 flex h-12 border-t border-tv-line bg-tv-bg min-[1101px]:hidden'
    >
      {items.map(({ page: item, soon }) => {
        const Icon = ICONS[item as (typeof PHONE_NAV)[number]];
        const label =
          item === 'home' ? copy.home : common.nav[item as 'resume'];
        if (soon)
          return (
            <span
              key={item}
              className='relative flex flex-1 cursor-default flex-col items-center justify-center gap-0.5 text-[11px] text-tv-dim pointer-coarse:min-h-12'
            >
              <Icon aria-hidden='true' className='size-5' strokeWidth={1.6} />
              {label}
              <span className='absolute top-1 right-[18%] rounded bg-tv-hover px-1 text-[9px] leading-3.5 font-semibold text-tv-mute'>
                {common.soon}
              </span>
            </span>
          );
        return (
          <Link
            key={item}
            href={WATCH[item].href}
            aria-current={item === page ? 'page' : undefined}
            className='relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-tv-mute transition-[color,background-color,scale] duration-100 after:absolute after:inset-x-6 after:top-0 after:h-0.5 after:origin-center after:scale-x-0 after:rounded-b after:bg-tv-accent after:transition-[scale] after:duration-160 after:ease-tv-out after:content-[""] active:scale-95 active:bg-tv-hover aria-[current=page]:text-tv-accent-ink aria-[current=page]:after:scale-x-100 pointer-coarse:min-h-12'
          >
            <Icon aria-hidden='true' className='size-5' strokeWidth={1.6} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

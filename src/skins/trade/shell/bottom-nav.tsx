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
  const items = navItems(pages).filter(
    ({ page: item, soon }) =>
      !soon && (PHONE_NAV as readonly PageKey[]).includes(item),
  );
  return (
    <nav
      aria-label={copy.bottomNav}
      className='fixed inset-x-0 bottom-0 z-20 flex h-12 border-t border-tv-line bg-tv-bg min-[1101px]:hidden'
    >
      {items.map(({ page: item }) => {
        const Icon = ICONS[item as (typeof PHONE_NAV)[number]];
        return (
          <Link
            key={item}
            href={WATCH[item].href}
            aria-current={item === page ? 'page' : undefined}
            className='flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] text-tv-mute aria-[current=page]:text-tv-accent-ink'
          >
            <Icon aria-hidden='true' className='size-5' strokeWidth={1.6} />
            {item === 'home' ? copy.home : common.nav[item as 'resume']}
          </Link>
        );
      })}
    </nav>
  );
}

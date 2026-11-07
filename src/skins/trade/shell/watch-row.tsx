/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Flag } from 'lucide-react';
import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { tradeCopy } from '@/content/copy/trade';
import { useCopy } from '@/lib/i18n/copy';
import type { PageKey } from '@/lib/content/schema';
import { WATCH } from '@/skins/trade/config';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { TvTile } from '@/skins/trade/ui/tv-tile';

const ROW =
  'relative grid min-h-[32px] w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-l-2 border-transparent px-3.5 text-left pointer-coarse:min-h-11';

/**
 * One page of the watchlist: a round tile and the ticker (decoration), the real name of the page, a count where there is one and a
 * flag on the page that is open. When a page becomes the open one its row flashes once. A page that is coming soon is marked and is
 * not a link, like the Standard menu.
 */
export function WatchRow({
  page,
  soon,
  current,
  count,
}: {
  page: PageKey;
  soon: boolean;
  current: boolean;
  /** a number the page can state (projects, jobs, years), or `null` */
  count: number | null;
}) {
  const common = useCopy(commonCopy);
  const trade = useCopy(tradeCopy);
  const { ticker, tile, href } = WATCH[page];
  const label = page === 'home' ? trade.home : common.nav[page];
  const body = (
    <>
      {current && (
        // mounts when the page becomes the open one, so the flash plays on every page change
        <span
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 animate-[tv-flash_1s_ease-out_both] bg-tv-accent/25'
        />
      )}
      <span className='relative flex min-w-0 items-center gap-2'>
        <TvTile tile={tile} size='sm'>
          {ticker.charAt(0)}
        </TvTile>
        <span aria-hidden='true' className='font-semibold'>
          {ticker}
        </span>
        <span className='truncate text-tv-mute'>{label}</span>
      </span>
      <span className='relative flex items-center gap-1.5'>
        {soon ? (
          <TvChip>{common.soon}</TvChip>
        ) : (
          count !== null && (
            <span aria-hidden='true' className='tabular-nums'>
              {count}
            </span>
          )
        )}
        {current && (
          <Flag
            aria-hidden='true'
            className='size-3.5 fill-tv-accent text-tv-accent'
          />
        )}
      </span>
    </>
  );
  return soon ? (
    <li>
      <span className={`${ROW} cursor-default text-tv-mute`}>{body}</span>
    </li>
  ) : (
    <li>
      <Link
        href={href}
        data-slot='tv-watch-row'
        data-roving=''
        aria-current={current ? 'page' : undefined}
        className={`${ROW} transition-[background-color] duration-100 hover:bg-tv-hover active:bg-tv-hover aria-[current=page]:border-tv-accent aria-[current=page]:bg-tv-hover`}
      >
        {body}
      </Link>
    </li>
  );
}

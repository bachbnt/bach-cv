/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Pause, Play } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useMemo, useState, type CSSProperties } from 'react';
import { commonCopy } from '@/content/copy/common';
import { homeCopy } from '@/content/copy/home';
import { tradeCopy } from '@/content/copy/trade';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { useLive } from '@/hooks/use-live';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { formatUsed } from '@/lib/derive/duration-label';
import {
  pageItems,
  tapeItems,
  techItems,
  type TapeItem,
} from '@/skins/trade/blocks/shell-tape';
import { navItems, WATCH, type Tile } from '@/skins/trade/config';
import { useCounts } from '@/skins/trade/shell/use-counts';
import { useDocumentHidden } from '@/skins/trade/shell/use-document-hidden';
import { TvTile } from '@/skins/trade/ui/tv-tile';

const TILE: Record<'mobile' | 'web' | 'ai' | 'tools', Tile> = {
  mobile: 'up',
  web: 'sky',
  ai: 'violet',
  tools: 'gold',
};

/** Seconds a full turn of the tape takes: slow, and longer with more items so the speed stays the same. */
const SECONDS_PER_ITEM = 3.2;

/**
 * The ticker tape across the top of the workspace: the pages with their counts and the skills with the years I used them
 * (computed from my roles, never invented). It scrolls slowly, stops while the pointer or the keyboard is on it and while the tab is
 * in the background, and has a button that stops it for good (a moving list needs a stop that works without a mouse). With reduced
 * motion it is a static row that wraps.
 */
export function TickerTape({ className }: { className?: string }) {
  const words = useCopy(tradeShellCopy).tape;
  const home = useCopy(homeCopy);
  const common = useCopy(commonCopy);
  const trade = useCopy(tradeCopy);
  const { pages } = useLive();
  const counts = useCounts();
  const { data: skills = [] } = useContentQuery('skills');
  const { data: jobs = [] } = useContentQuery('experience');
  const [now] = useState(() => new Date());
  const [paused, setPaused] = useState(false);
  const hidden = useDocumentHidden();

  const items = useMemo(
    () =>
      tapeItems(
        pageItems(navItems(pages), counts),
        techItems(skills, jobs, now),
      ),
    [pages, counts, skills, jobs, now],
  );
  if (items.length === 0) return null;

  const label = (item: TapeItem) =>
    item.kind === 'page'
      ? item.page === 'home'
        ? trade.home
        : common.nav[item.page]
      : item.label;

  const render = (item: TapeItem) => {
    if (item.kind === 'page') {
      return (
        <Link
          href={WATCH[item.page].href}
          className='flex h-full items-center gap-1.5 px-3 transition-colors hover:bg-tv-hover active:bg-tv-hover'
        >
          <span className='font-semibold'>{label(item)}</span>
          {item.count !== null && (
            <span className='text-tv-mute tabular-nums'>{item.count}</span>
          )}
        </Link>
      );
    }
    const used = item.months === null ? null : formatUsed(item.months, words);
    return (
      <span
        title={used ? fill(words.yearsUsed, { years: used }) : undefined}
        className='flex h-full items-center gap-1.5 px-3'
      >
        <TvTile tile={TILE[item.category]} size='sm'>
          {item.label.charAt(0).toUpperCase()}
        </TvTile>
        <span className='font-semibold'>{item.label}</span>
        {used && <span className='text-tv-mute tabular-nums'>{used}</span>}
      </span>
    );
  };

  const list = (copy: boolean) => (
    <ul
      aria-hidden={copy || undefined}
      inert={copy || undefined}
      className={cn(
        'flex h-full flex-none items-stretch divide-x divide-tv-line',
        copy && 'motion-reduce:hidden',
        'motion-reduce:flex-wrap motion-reduce:divide-x-0',
      )}
    >
      {items.map((item) => (
        <Fragment key={item.key}>
          <li className='flex h-full items-center'>{render(item)}</li>
        </Fragment>
      ))}
    </ul>
  );

  return (
    <section
      aria-label={words.label}
      className={cn(
        'group/tape flex min-w-0 items-stretch overflow-hidden border-b border-tv-line bg-tv-bg text-xs',
        className,
      )}
    >
      <button
        type='button'
        aria-pressed={paused}
        aria-label={paused ? home.playTechnologies : home.pauseTechnologies}
        onClick={() => setPaused((on) => !on)}
        className='grid size-[30px] flex-none cursor-pointer place-items-center border-r border-tv-line text-tv-mute transition-[background-color,transform] duration-100 hover:bg-tv-hover hover:text-tv-ink active:scale-90 motion-reduce:hidden pointer-coarse:size-11'
      >
        {paused ? (
          <Play aria-hidden='true' className='size-3.5' />
        ) : (
          <Pause aria-hidden='true' className='size-3.5' />
        )}
      </button>
      <div className='min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,#000_0,#000_94%,transparent)] motion-reduce:[mask-image:none]'>
        <div
          data-paused={paused || hidden || undefined}
          style={
            {
              '--tv-tape-s': `${Math.round(items.length * SECONDS_PER_ITEM)}s`,
            } as CSSProperties
          }
          className='flex h-[30px] w-max animate-[tv-tape_var(--tv-tape-s)_linear_infinite] items-stretch data-paused:[animation-play-state:paused] group-has-[a:focus-visible]/tape:[animation-play-state:paused] group-hover/tape:[animation-play-state:paused] motion-reduce:h-auto motion-reduce:w-auto motion-reduce:animate-none motion-reduce:py-1'
        >
          {list(false)}
          {list(true)}
        </div>
      </div>
    </section>
  );
}

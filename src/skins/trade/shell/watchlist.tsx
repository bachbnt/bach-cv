/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Tabs } from '@base-ui/react/tabs';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { tradeCopy } from '@/content/copy/trade';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { WatchDetails } from '@/skins/trade/shell/watch-details';
import { WatchPages } from '@/skins/trade/shell/watch-pages';
import { WatchRoles } from '@/skins/trade/shell/watch-roles';
import { WatchTech } from '@/skins/trade/shell/watch-tech';

const TABS = ['pages', 'skills', 'roles'] as const;

/**
 * The right widget: a watchlist with three lists as tabs (the pages, which are the navigation, the skills with their
 * sparklines, and the roles as a timeline), and under them the Details widget.
 */
export function Watchlist({
  page,
  className,
}: {
  page: PageKey | null;
  className?: string;
}) {
  const title = useCopy(tradeCopy).watchlist.title;
  const words = useCopy(tradeShellCopy).watch;
  return (
    <aside
      aria-label={title}
      className={cn(
        'flex min-h-0 flex-col border-tv-line bg-tv-bg max-[1100px]:border-t min-[1101px]:border-l',
        className,
      )}
    >
      <div className='flex h-[38px] flex-none items-center border-b border-tv-line px-3.5 pointer-coarse:h-11'>
        <h2 className='text-[13px] font-bold'>{title}</h2>
      </div>
      <Tabs.Root
        defaultValue='pages'
        className='flex max-h-[420px] min-h-0 flex-col min-[1101px]:max-h-none min-[1101px]:flex-[1_1_58%]'
      >
        <Tabs.List
          aria-label={words.tabs}
          activateOnFocus
          className='relative flex flex-none border-b border-tv-line'
        >
          {TABS.map((tab) => (
            <Tabs.Tab
              key={tab}
              value={tab}
              className='h-8 flex-1 cursor-pointer px-2 text-xs font-semibold text-tv-mute transition-[background-color,color] duration-100 hover:bg-tv-hover hover:text-tv-ink active:bg-tv-hover aria-selected:text-tv-ink pointer-coarse:h-11'
            >
              {words[tab]}
            </Tabs.Tab>
          ))}
          {/* the accent line slides to the tab that is selected (Base UI measures the tab and sets the variables) */}
          <Tabs.Indicator className='pointer-events-none absolute bottom-0 left-0 h-0.5 w-(--active-tab-width) translate-x-(--active-tab-left) bg-tv-accent transition-[translate,width] duration-240 ease-tv-out motion-reduce:transition-none' />
        </Tabs.List>
        <Tabs.Panel
          value='pages'
          className='tv-rise min-h-0 flex-1 overflow-y-auto outline-none'
        >
          <WatchPages page={page} />
        </Tabs.Panel>
        <Tabs.Panel
          value='skills'
          className='tv-rise flex min-h-0 flex-1 flex-col outline-none'
        >
          <WatchTech />
        </Tabs.Panel>
        <Tabs.Panel
          value='roles'
          className='tv-rise flex min-h-0 flex-1 flex-col outline-none'
        >
          <WatchRoles />
        </Tabs.Panel>
      </Tabs.Root>
      <div className='min-h-0 flex-[0_1_42%] overflow-y-auto border-t border-tv-line max-[1100px]:flex-none'>
        <WatchDetails />
      </div>
    </aside>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { tabTarget } from '@/skins/stream/blocks/channel-facts';

export interface ChannelTab {
  id: string;
  label: string;
  panel: ReactNode;
}

/**
 * The row of tabs of a channel page, and the panel of the one that is open. A real tab list: the arrow keys, Home and End move between
 * the tabs, only the open tab is in the tab order, and only the open panel is in the page. The row sticks under the top bar.
 */
export function ChannelTabs({
  label,
  tabs,
}: {
  label: string;
  tabs: ChannelTab[];
}) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();
  const current = tabs[active] ?? tabs[0];

  return (
    <>
      <div
        role='tablist'
        aria-label={label}
        className='sticky top-14 z-10 mt-4 flex overflow-x-auto border-b border-sm-line bg-sm-bg px-3 [scrollbar-width:none] min-[701px]:px-0'
        onKeyDown={(event) => {
          // the arrows start from the tab that has the focus
          const from = refs.current.indexOf(event.target as HTMLButtonElement);
          const next = tabTarget(
            event.key,
            from < 0 ? active : from,
            tabs.length,
          );
          if (next === null) return;
          event.preventDefault();
          setActive(next);
          refs.current[next]?.focus();
        }}
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[i] = node;
            }}
            type='button'
            role='tab'
            id={`${base}-${tab.id}-tab`}
            aria-selected={i === active}
            aria-controls={i === active ? `${base}-panel` : undefined}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className={cn(
              'relative inline-flex h-12 cursor-pointer items-center px-5 text-sm font-medium tracking-wide whitespace-nowrap text-sm-mute uppercase transition-colors hover:text-sm-ink aria-selected:text-sm-ink pointer-coarse:h-12',
              'after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-sm-ink after:opacity-0 aria-selected:after:opacity-100',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role='tabpanel'
        id={`${base}-panel`}
        aria-labelledby={`${base}-${current.id}-tab`}
        tabIndex={0}
        className='outline-offset-[-2px]'
      >
        {current.panel}
      </div>
    </>
  );
}

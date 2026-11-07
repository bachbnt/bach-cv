/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

/**
 * A bar of the champion bar with a tick for every unit it counts: a project, a skill. The fill is the whole bar (these are counts of what
 * exists, not a level that goes down), and the label says what is counted, so the bar is never a number without a name.
 */
export function HudBar({
  label,
  count,
  tone,
}: {
  label: string;
  count: number | null;
  tone: 'hp' | 'mp';
}) {
  const units = Math.min(Math.max(count ?? 0, 1), 40);
  return (
    <div className='min-w-0'>
      <div className='mb-0.5 flex items-baseline justify-between gap-2 text-[10px] leading-none font-bold tracking-[0.14em] uppercase'>
        <span className='truncate text-mb-mute'>{label}</span>
        <span className='font-mb-display text-[15px] tracking-normal text-mb-title tabular-nums'>
          {count ?? '–'}
        </span>
      </div>
      <div className='mb-bar' aria-hidden='true'>
        <div
          className={cn('mb-bar-fill', tone === 'hp' ? 'bg-mb-hp' : 'bg-mb-mp')}
          style={{
            width: count === null ? '0%' : '100%',
            backgroundImage:
              'linear-gradient(180deg, rgb(255 255 255 / 0.35), transparent 55%, rgb(0 0 0 / 0.25))',
          }}
        />
        <div
          className='mb-bar-ticks'
          style={{ '--tick': `${100 / units}%` } as CSSProperties}
        />
      </div>
    </div>
  );
}

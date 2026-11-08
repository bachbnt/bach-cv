/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { tradeChartCopy } from '@/content/copy/trade-chart';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import type { Measure } from '@/skins/trade/chart/drawings';

/** What the measure tool found between two points: the weeks and years, the two jobs at the ends and the change in index points. */
export function MeasureLabel({
  x,
  y,
  below,
  measure,
  from,
  to,
  up,
}: {
  x: number;
  y: number;
  /** the box is under the point when there is no room above it */
  below: boolean;
  measure: Measure;
  from: string;
  to: string;
  up: boolean;
}) {
  const copy = useCopy(tradeChartCopy).measure;
  return (
    <div
      role='status'
      data-testid='tv-measure'
      style={{ left: x, top: y }}
      className={`pointer-events-none absolute z-[4] w-max max-w-[min(260px,calc(100%-16px))] -translate-x-1/2 rounded-md px-2.5 py-1.5 text-xs leading-snug text-white shadow-tv-menu ${below ? '' : '-translate-y-full'} ${up ? 'bg-tv-accent' : 'bg-tv-down'}`}
    >
      <b className='block font-semibold tabular-nums'>
        {fill(copy.span, { weeks: measure.weeks, years: measure.years })}
      </b>
      <span className='block tabular-nums'>
        {fill(copy.change, {
          delta: `${measure.delta > 0 ? '+' : ''}${measure.delta}`,
        })}
      </span>
      <span className='block opacity-90'>{fill(copy.from, { job: from })}</span>
      <span className='block opacity-90'>{fill(copy.to, { job: to })}</span>
    </div>
  );
}

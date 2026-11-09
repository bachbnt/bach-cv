/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo, useRef } from 'react';
import { useBox } from '@/hooks/use-box';
import { useNow } from '@/hooks/use-now';
import { buildCandles } from '@/lib/derive/career-series';
import { useContentQuery } from '@/lib/query/use-content';
import { CANDLE_SEED, type RangeKey } from '@/skins/trade/config';
import { ChartBody } from '@/skins/trade/chart/chart-body';
import { studiesOf } from '@/skins/trade/chart/education';
import { useLoopGate } from '@/skins/trade/shell/use-loop-gate';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** One empty list for a query that has not answered yet, so the memos below keep their value until it does. */
const NONE: never[] = [];

/**
 * The career as a real working chart (a terminal in the style of TradingView, drawn by hand in SVG, no chart library). One candle
 * for each week (or month, quarter or year, the visitor picks) from my first job; the flags are the jobs themselves. The values are an illustrative index derived from those jobs:
 * a decoration that is not a quote and not financial data, and the chart says so in its name. This part loads the jobs, measures the
 * box and shows the skeleton, the empty chart or the scene.
 */
export function CareerChart({
  range,
  onOpenJob,
  onOpenDegree,
}: {
  /** the window the chart opens on (the range buttons change it afterwards) */
  range: RangeKey;
  /** a flag was activated: show that job on the Resume page */
  onOpenJob: (id: string) => void;
  /** a graduation flag was activated: show the education on the Resume page */
  onOpenDegree: (id: string) => void;
}) {
  const query = useContentQuery('experience');
  const schooling = useContentQuery('education');
  const now = useNow();
  const box = useRef<HTMLDivElement>(null);
  const size = useBox(box);
  const gate = useLoopGate();

  const entries = query.data ?? NONE;
  const degrees = schooling.data ?? NONE;
  const studies = useMemo(() => studiesOf(degrees), [degrees]);
  // the chart starts at the first job; the degrees only shape the volume a little
  const { candles, markers } = useMemo(
    () => buildCandles(entries, CANDLE_SEED, now, degrees),
    [entries, degrees, now],
  );
  // the volume depends on both, so the chart is not drawn until both have arrived (the bars would change when the degrees came)
  const pending = query.isPending || schooling.isPending;

  return (
    <div ref={box} className='absolute inset-0 overflow-hidden'>
      {/* the live dot, the pulse of the last price and the glow of the playhead wait while the chart is scrolled out of view */}
      <div ref={gate} className='absolute inset-0'>
        <TvDataState
          query={{
            isPending: pending,
            isError: query.isError,
            refetch: () => query.refetch(),
          }}
          count={candles.length}
          empty='experience'
          subject='experience'
          skeleton={<TvSkeleton className='absolute inset-0 border-0' />}
          // the skeleton fills the cell; a notice is a card at its corner
          className='absolute inset-0 data-[state]:inset-auto data-[state]:top-3 data-[state]:left-3'
        >
          {size.width > 0 && size.height > 0 && (
            <ChartBody
              candles={candles}
              markers={markers}
              entries={entries}
              studies={studies}
              width={size.width}
              height={size.height}
              initialRange={range}
              onOpenJob={onOpenJob}
              onOpenDegree={onOpenDegree}
            />
          )}
        </TvDataState>
      </div>
    </div>
  );
}

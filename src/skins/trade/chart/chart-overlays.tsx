/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import type { Measure } from '@/skins/trade/chart/drawings';
import { TV_FIELD } from '@/skins/trade/ui/tv-field';

/** A one-line hint of what the active tool wants next. It is polite live text, so a screen reader hears it too. */
export function HintPill({ text, top }: { text: string; top: number }) {
  return (
    <p
      role='status'
      data-testid='tv-hint'
      style={{ top: top + 8 }}
      className='tv-chart-rise pointer-events-none absolute left-1/2 z-[4] max-w-[calc(100%-24px)] -translate-x-1/2 rounded-md bg-tv-tip px-2.5 py-1 text-center text-xs text-white shadow-tv-menu'
    >
      {text}
    </p>
  );
}

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

/** The box for a text note, where the visitor clicked. Enter keeps the note, Escape drops it, and leaving the box keeps what was written. */
export function NoteInput({
  x,
  y,
  onDone,
}: {
  x: number;
  y: number;
  onDone: (text: string | null) => void;
}) {
  const copy = useCopy(tradeChartCopy).tools;
  const input = useRef<HTMLInputElement>(null);
  const settled = useRef(false);
  useEffect(() => {
    input.current?.focus();
  }, []);
  const finish = (text: string | null) => {
    if (settled.current) return;
    settled.current = true;
    onDone(text);
  };
  return (
    <input
      ref={input}
      type='text'
      maxLength={80}
      aria-label={copy.noteLabel}
      placeholder={copy.notePlaceholder}
      style={{ left: x, top: y - 28 }}
      className={cn(
        TV_FIELD,
        'absolute z-[6] h-7 w-44 border-tv-accent px-2 text-xs shadow-tv-menu pointer-coarse:h-9',
      )}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter')
          finish(event.currentTarget.value.trim() || null);
        if (event.key === 'Escape') finish(null);
      }}
      onBlur={(event) => finish(event.currentTarget.value.trim() || null)}
    />
  );
}

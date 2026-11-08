/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { ChevronDown, Eye, EyeOff, X } from 'lucide-react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import type { Candle } from '@/lib/derive/career-series';
import type {
  IndicatorId,
  IndicatorMode,
  Tone,
} from '@/skins/trade/chart/chart-types';
import { legendRows, type LegendRow } from '@/skins/trade/chart/legend-rows';
import type { Indicators } from '@/skins/trade/chart/chart-types';
import type { IndicatorData } from '@/skins/trade/chart/indicators';
import { formatVolume } from '@/skins/trade/chart/volume';
import type { Pane } from '@/skins/trade/chart/view';

const TONE: Record<Tone, string> = {
  up: 'text-tv-up-ink',
  down: 'text-tv-down-ink',
  gold: 'text-tv-gold-ink',
  sky: 'text-tv-sky-ink',
  violet: 'text-tv-violet-ink',
  accent: 'text-tv-accent-ink',
  orange: 'text-tv-orange-ink',
  lime: 'text-[var(--tv-ind-lime-ink)]',
  pink: 'text-[var(--tv-ind-pink-ink)]',
  teal: 'text-[var(--tv-ind-teal-ink)]',
  slate: 'text-[var(--tv-ind-slate-ink)]',
};

const PANE_IDS: IndicatorId[] = ['rsi', 'macd'];

const format = (value: number | null) =>
  value === null ? '—' : value.toFixed(2);

function Row({
  row,
  onMode,
}: {
  row: LegendRow;
  onMode: (id: IndicatorId, mode: IndicatorMode) => void;
}) {
  const copy = useCopy(tradeChartCopy);
  const short = copy.indicators[row.id].short;
  const hidden = row.mode === 'hidden';
  const Icon = hidden ? EyeOff : Eye;
  const button =
    'pointer-events-auto relative grid size-5 cursor-pointer place-items-center rounded text-tv-mute opacity-0 transition-[opacity,background-color,color,scale] duration-100 group-focus-within/row:opacity-100 group-hover/row:opacity-100 hover:bg-tv-hover hover:text-tv-ink active:scale-90 active:bg-tv-hover pointer-coarse:opacity-100 pointer-coarse:size-6 after:absolute after:-inset-1.5 after:content-[""] pointer-coarse:after:-inset-x-1 pointer-coarse:after:-inset-y-2.5';
  return (
    <div
      role='group'
      aria-label={short}
      data-legend-row={row.id}
      data-mode={row.mode}
      className='tv-chart-fade-in group/row flex items-center gap-1.5 text-xs'
    >
      <span
        aria-hidden='true'
        className={cn('flex gap-x-2', hidden && 'opacity-40')}
      >
        <span className='text-tv-mute'>{short}</span>
        {row.values.map((v, k) => (
          <b key={k} className={cn('font-medium', TONE[v.tone])}>
            {row.id === 'volume' && v.value !== null
              ? formatVolume(v.value)
              : format(v.value)}
          </b>
        ))}
      </span>
      <button
        type='button'
        aria-label={fill(hidden ? copy.legend.show : copy.legend.hide, {
          name: short,
        })}
        onClick={() => onMode(row.id, hidden ? 'shown' : 'hidden')}
        className={button}
      >
        <Icon aria-hidden='true' className='size-3.5' />
      </button>
      <button
        type='button'
        aria-label={fill(copy.legend.remove, { name: short })}
        onClick={() => onMode(row.id, 'off')}
        className={button}
      >
        <X aria-hidden='true' className='size-3.5' />
      </button>
    </div>
  );
}

/**
 * The legend in the corner of the chart. The first lines are the values of the bar under the crosshair (or of the last one); under
 * them is one row for each indicator that is on, with its values and a control to hide or remove it. The rows of the RSI and the MACD
 * sit at the top of their own panes. The values are index points of a decoration; the controls are real buttons.
 */
export function Legend({
  name,
  company,
  candle,
  date,
  job,
  study,
  indicators,
  data,
  index,
  interval,
  top,
  panes,
  onMode,
}: {
  name: string;
  company: string;
  candle: Candle | null;
  date: string;
  job: string;
  /** the degree in progress at the bar (`MSc · University of Science`), or empty */
  study: string;
  indicators: Indicators;
  data: IndicatorData;
  index: number;
  /** the short name of the interval of the candles (1W) */
  interval: string;
  /** where the legend starts: under the buttons of the chart */
  top: number;
  panes: { rsi: Pane | null; macd: Pane | null };
  onMode: (id: IndicatorId, mode: IndicatorMode) => void;
}) {
  const copy = useCopy(tradeChartCopy);
  const [open, setOpen] = useState(true);
  const rows = legendRows(indicators, data, candle, index);
  const tone =
    candle && candle.c >= candle.o ? 'text-tv-up-ink' : 'text-tv-down-ink';
  const overlay = rows.filter((r) => !PANE_IDS.includes(r.id));
  return (
    <>
      <div
        data-testid='tv-legend'
        style={{ top: top + 6 }}
        className='pointer-events-none absolute left-3 z-[2] flex max-w-[calc(100%-90px)] flex-col gap-0.5 text-[13px] tabular-nums'
      >
        <div
          aria-hidden='true'
          className='flex flex-wrap items-center gap-x-2.5 gap-y-0.5 font-medium'
        >
          <span className='tv-live size-2 rounded-full bg-tv-up' />
          <b className='font-semibold'>{name}</b>
          <span className='font-normal text-tv-mute'>
            · {interval} · {copy.chart.name}
            {company && ` · ${company}`}
          </span>
          {candle && (
            <span className='flex flex-wrap gap-x-2 text-xs max-[560px]:hidden'>
              {(
                [
                  ['o', copy.legend.open],
                  ['h', copy.legend.high],
                  ['l', copy.legend.low],
                  ['c', copy.legend.close],
                ] as const
              ).map(([key, letter]) => (
                <span key={key}>
                  <span className='text-tv-mute'>{letter} </span>
                  <b className={cn('font-medium', tone)}>
                    {candle[key].toFixed(2)}
                  </b>
                </span>
              ))}
            </span>
          )}
        </div>
        <div
          data-testid='tv-legend-date'
          aria-hidden='true'
          className='flex flex-wrap gap-x-2 text-xs text-tv-mute'
        >
          <span>{date}</span>
          {job && <span className='text-tv-ink'>{job}</span>}
          {study && <span className='text-tv-violet-ink'>{study}</span>}
        </div>
        {overlay.length > 0 && (
          <button
            type='button'
            aria-expanded={open}
            aria-label={open ? copy.legend.collapse : copy.legend.expand}
            onClick={() => setOpen((v) => !v)}
            className='pointer-events-auto relative grid size-5 w-fit cursor-pointer place-items-center rounded text-tv-mute transition-[background-color,color,scale] duration-100 hover:bg-tv-hover hover:text-tv-ink active:scale-90 active:bg-tv-hover pointer-coarse:size-6 pointer-coarse:after:absolute pointer-coarse:after:-inset-2.5 pointer-coarse:after:content-[""]'
          >
            <ChevronDown
              aria-hidden='true'
              className={cn(
                'size-3.5 transition-transform duration-160',
                !open && '-rotate-90',
              )}
            />
          </button>
        )}
        {open &&
          overlay.map((row) => <Row key={row.id} row={row} onMode={onMode} />)}
      </div>
      {rows
        .filter((r) => PANE_IDS.includes(r.id))
        .map((row) => {
          const pane = panes[row.id as 'rsi' | 'macd'];
          if (!pane) return null;
          return (
            <div
              key={row.id}
              style={{ top: pane.top + 2 }}
              className='pointer-events-none absolute left-3 z-[2] tabular-nums'
            >
              <Row row={row} onMode={onMode} />
            </div>
          );
        })}
    </>
  );
}

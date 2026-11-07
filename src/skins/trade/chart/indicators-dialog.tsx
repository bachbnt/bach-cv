/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Search } from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TV_FIELD } from '@/skins/trade/ui/tv-field';
import { chartStore, useChartStore } from '@/skins/trade/chart/chart-store';
import {
  INDICATOR_IDS,
  INTERVALS,
  type IndicatorId,
} from '@/skins/trade/chart/chart-types';
import {
  INDICATOR_INFO,
  type IndicatorGroup,
} from '@/skins/trade/chart/indicators';
import { TvDialogShell } from '@/skins/trade/shell/overlay-dialog-shell';

const GROUPS: IndicatorGroup[] = [
  'moving',
  'volatility',
  'oscillators',
  'volume',
];

/**
 * The Indicators window: a search field, the indicators in groups (moving averages, volatility, oscillators, volume) and a switch for
 * each. An indicator that needs more bars than the interval has (an average of 100 bars on 80 monthly candles) can be switched on
 * but says what it needs and which interval has enough, and is drawn as soon as one is chosen. It is loaded the first time it opens.
 */
export default function IndicatorsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const copy = useCopy(tradeChartCopy);
  const words = copy.indicators;
  const indicators = useChartStore((s) => s.indicators);
  const count = useChartStore((s) => s.count);
  const intervalBars = useChartStore((s) => s.intervalBars);
  const [query, setQuery] = useState('');
  const searchId = useId();

  const wanted = query.trim().toLowerCase();
  const matches = (id: IndicatorId) =>
    wanted === '' ||
    `${words[id].name} ${words[id].short}`.toLowerCase().includes(wanted);
  const groups = useMemo(
    () =>
      GROUPS.map((group) => ({
        group,
        ids: INDICATOR_IDS.filter((id) => INDICATOR_INFO[id].group === group),
      })),
    [],
  );
  const shown = groups.map((g) => ({ ...g, ids: g.ids.filter(matches) }));
  const empty = shown.every((g) => g.ids.length === 0);

  /** What an indicator that has too few bars says: how many it needs and where there are enough. */
  const note = (id: IndicatorId) => {
    const needs = INDICATOR_INFO[id].needs;
    if (count === 0 || count >= needs) return '';
    const enough = INTERVALS.filter((i) => intervalBars[i] >= needs).map(
      (i) => copy.intervals[i].short,
    );
    return fill(enough.length > 0 ? words.needs : words.needsNone, {
      bars: needs,
      enough: enough.join(', '),
    });
  };

  return (
    <TvDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title={words.title}
      description={words.description}
      closeLabel={copy.toolbar.close}
      size='sm'
      bodyClassName='gap-3 p-4'
    >
      <div data-testid='tv-indicators' className='flex min-h-0 flex-col gap-3'>
        <p className='text-xs text-tv-mute'>{words.description}</p>
        <label htmlFor={searchId} className='sr-only'>
          {words.search}
        </label>
        <div className='relative'>
          <Search
            aria-hidden='true'
            className='pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-tv-mute'
          />
          <input
            id={searchId}
            type='search'
            value={query}
            placeholder={words.searchHint}
            onChange={(event) => setQuery(event.target.value)}
            className={cn(TV_FIELD, 'pl-8')}
          />
        </div>
        <div className='flex max-h-[55dvh] flex-col gap-3 overflow-y-auto'>
          {shown.map(
            ({ group, ids }) =>
              ids.length > 0 && (
                <section
                  key={group}
                  data-group={group}
                  className='flex flex-col gap-1'
                >
                  <h3 className='text-[11px] font-bold tracking-wide text-tv-mute uppercase'>
                    {words.groups[group]}
                  </h3>
                  {ids.map((id) => {
                    const on = indicators[id] !== 'off';
                    const hint = note(id);
                    return (
                      <button
                        key={id}
                        type='button'
                        role='switch'
                        aria-checked={on}
                        aria-describedby={
                          hint ? `${searchId}-${id}` : undefined
                        }
                        data-indicator-switch={id}
                        data-short={hint ? '' : undefined}
                        onClick={() => chartStore.toggleIndicator(id)}
                        className='flex min-h-9 cursor-pointer flex-wrap items-center gap-x-3 rounded px-2 py-1 text-left text-[13px] hover:bg-tv-hover pointer-coarse:min-h-11'
                      >
                        <span className={cn('flex-1', hint && 'opacity-60')}>
                          {words[id].name}
                        </span>
                        <span className='text-xs text-tv-mute tabular-nums'>
                          {words[id].short}
                        </span>
                        <span
                          aria-hidden='true'
                          className={cn(
                            'relative h-5 w-9 shrink-0 rounded-full transition-colors',
                            on ? 'bg-tv-accent' : 'bg-tv-dim/60',
                            hint && 'opacity-60',
                          )}
                        >
                          <span
                            className={cn(
                              'absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform',
                              on && 'translate-x-4',
                            )}
                          />
                        </span>
                        <span className='sr-only'>
                          {on ? words.on : words.off}
                        </span>
                        {hint && (
                          <span
                            id={`${searchId}-${id}`}
                            data-testid='tv-indicator-note'
                            className='basis-full text-xs text-tv-mute'
                          >
                            {hint}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </section>
              ),
          )}
          {empty && (
            <p
              role='status'
              className='py-3 text-center text-[13px] text-tv-mute'
            >
              {words.none}
            </p>
          )}
        </div>
      </div>
    </TvDialogShell>
  );
}

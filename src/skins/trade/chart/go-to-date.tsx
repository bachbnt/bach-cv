/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown } from 'lucide-react';
import { useId, useMemo, useState, type ComponentProps } from 'react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { longMonthName } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { chartStore, useChartStore } from '@/skins/trade/chart/chart-store';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TV_FIELD } from '@/skins/trade/ui/tv-field';
import { cn } from '@/lib/utils';

/** A native select (the phone's own picker) with the skin's field look and its own chevron. */
function Select({ className, ...props }: ComponentProps<'select'>) {
  return (
    <span className='relative block'>
      <select
        className={cn(
          TV_FIELD,
          'cursor-pointer appearance-none pr-7',
          className,
        )}
        {...props}
      />
      <ChevronDown
        aria-hidden='true'
        className='pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-tv-mute'
      />
    </span>
  );
}

/** The form of "Go to date": a month and a year of the career, and the chart centres on that week. It is loaded when the popover first opens. */
export default function GoToDate({ onDone }: { onDone: () => void }) {
  const copy = useCopy(tradeChartCopy).goto;
  const { lang } = useLang();
  const bounds = useChartStore((s) => s.bounds);
  const first = bounds ? new Date(bounds.first).getFullYear() : 2020;
  const final = bounds ? new Date(bounds.last).getFullYear() : first;
  const [year, setYear] = useState(final);
  const [month, setMonth] = useState(0);
  const monthId = useId();
  const yearId = useId();
  const months = useMemo(
    () => Array.from({ length: 12 }, (_, m) => longMonthName(m, lang)),
    [lang],
  );
  return (
    <form
      className='flex flex-col gap-3'
      onSubmit={(event) => {
        event.preventDefault();
        chartStore.controller()?.goTo(year, month);
        onDone();
      }}
    >
      <div className='grid grid-cols-[minmax(0,1fr)_92px] gap-2'>
        <label
          className='flex flex-col gap-1 text-xs font-medium text-tv-mute'
          htmlFor={monthId}
        >
          {copy.month}
          <Select
            id={monthId}
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
          >
            {months.map((name, m) => (
              <option key={name} value={m}>
                {name}
              </option>
            ))}
          </Select>
        </label>
        <label
          className='flex flex-col gap-1 text-xs font-medium text-tv-mute'
          htmlFor={yearId}
        >
          {copy.year}
          <Select
            id={yearId}
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
          >
            {Array.from({ length: final - first + 1 }, (_, k) => first + k).map(
              (y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ),
            )}
          </Select>
        </label>
      </div>
      <TvButton type='submit' variant='primary' className='self-end'>
        {copy.go}
      </TvButton>
    </form>
  );
}

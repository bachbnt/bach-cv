/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import {
  CalendarSearch,
  Keyboard,
  Maximize,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useCopy } from '@/lib/i18n/copy';
import { chartStore, useChartStore } from '@/skins/trade/chart/chart-store';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import { RANGES, type RangeKey } from '@/skins/trade/config';
import { cn } from '@/lib/utils';
import { TV_POPUP } from '@/skins/trade/ui/tv-menu';

const GoToDate = dynamic(() => import('@/skins/trade/chart/go-to-date'), {
  ssr: false,
});

const button =
  'inline-flex h-6 shrink-0 cursor-pointer items-center justify-center gap-1 rounded px-2 hover:bg-tv-hover pointer-coarse:h-11 pointer-coarse:min-w-11 [&_svg]:size-3.5';
const pressed = 'bg-tv-hover text-tv-accent-ink';

/**
 * The bar under the chart: the range buttons (3M ... All) that slide the window, Go to date, zoom, the list of keyboard shortcuts, and the
 * switches of the price scale (log, auto fit) and the reset of the chart. The pressed range is the one the window is on now: after a zoom or a pan none is. Until the
 * chart has loaded, `range` (the one it will open on) is shown as pressed.
 */
export function RangeBar({
  range,
  onChange,
}: {
  range: RangeKey;
  onChange: (range: RangeKey) => void;
}) {
  const copy = useCopy(tradeChartCopy);
  const ready = useChartStore((s) => s.count > 0);
  const active = useChartStore((s) => s.activeRange);
  const log = useChartStore((s) => s.log);
  const auto = useChartStore((s) => s.auto);
  const [open, setOpen] = useState(false);
  return (
    <div
      role='toolbar'
      aria-label={copy.ranges.label}
      className='relative flex h-8 items-center gap-0.5 overflow-x-auto border-t border-tv-line bg-tv-bg px-2 text-xs max-[1100px]:h-11 min-[1101px]:col-2 min-[1101px]:row-3'
    >
      <div
        role='group'
        aria-label={copy.ranges.label}
        className='flex items-center gap-0.5'
      >
        {RANGES.map(({ key }) => (
          <HintTip key={key} label={copy.ranges[key].name} side='top'>
            <button
              type='button'
              aria-pressed={ready ? active === key : range === key}
              onClick={() => {
                onChange(key);
                chartStore.controller()?.setRange(key);
              }}
              className={cn(
                button,
                (ready ? active === key : range === key) && pressed,
              )}
            >
              {copy.ranges[key].short}
            </button>
          </HintTip>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          aria-label={copy.goto.open}
          disabled={!ready}
          className={cn(button, 'disabled:opacity-50', open && pressed)}
        >
          <CalendarSearch aria-hidden='true' />
          <span className='max-[720px]:sr-only'>{copy.goto.open}</span>
        </PopoverTrigger>
        <PopoverContent
          align='start'
          side='top'
          className={cn('w-72 p-3', TV_POPUP)}
        >
          <GoToDate onDone={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
      <span className='flex-1' />
      <HintTip label={copy.scale.zoomOut} shortcut='−' side='top'>
        <button
          type='button'
          aria-label={copy.scale.zoomOut}
          disabled={!ready}
          onClick={() => chartStore.controller()?.zoom(1.4)}
          className={cn(button, 'disabled:opacity-50')}
        >
          <ZoomOut aria-hidden='true' />
        </button>
      </HintTip>
      <HintTip label={copy.scale.zoomIn} shortcut='+' side='top'>
        <button
          type='button'
          aria-label={copy.scale.zoomIn}
          disabled={!ready}
          onClick={() => chartStore.controller()?.zoom(1 / 1.4)}
          className={cn(button, 'disabled:opacity-50')}
        >
          <ZoomIn aria-hidden='true' />
        </button>
      </HintTip>
      <HintTip label={copy.toolbar.shortcuts} shortcut='?' side='top'>
        <button
          type='button'
          aria-label={copy.toolbar.shortcuts}
          disabled={!ready}
          onClick={() => chartStore.setShortcutsOpen(true)}
          className={cn(button, 'disabled:opacity-50')}
        >
          <Keyboard aria-hidden='true' />
        </button>
      </HintTip>
      <HintTip label={copy.scale.log} side='top'>
        <button
          type='button'
          aria-pressed={log}
          onClick={() => chartStore.setLog(!log)}
          className={cn(button, 'tabular-nums', log && pressed)}
        >
          <span aria-hidden='true'>{copy.scale.logShort}</span>
          <span className='sr-only'>{copy.scale.log}</span>
        </button>
      </HintTip>
      <HintTip label={copy.scale.auto} side='top'>
        <button
          type='button'
          aria-pressed={auto}
          onClick={() => chartStore.setAuto(true)}
          className={cn(button, auto && pressed)}
        >
          <span aria-hidden='true'>{copy.scale.autoShort}</span>
          <span className='sr-only'>{copy.scale.auto}</span>
        </button>
      </HintTip>
      <HintTip label={copy.scale.fit} side='top'>
        <button
          type='button'
          aria-label={copy.scale.fit}
          disabled={!ready}
          onClick={() => chartStore.controller()?.fit()}
          className={cn(button, 'disabled:opacity-50')}
        >
          <Maximize aria-hidden='true' />
        </button>
      </HintTip>
    </div>
  );
}

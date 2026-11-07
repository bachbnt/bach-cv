/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { createPortal } from 'react-dom';
import { ChevronDown, ListPlus, Play, Redo2, Undo2 } from 'lucide-react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chartStore, useChartStore } from '@/skins/trade/chart/chart-store';
import {
  CHART_TYPES,
  INDICATOR_IDS,
  INTERVALS,
  type ChartType,
  type Interval,
} from '@/skins/trade/chart/chart-types';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import { TypeIcon } from '@/skins/trade/chart/type-icon';
import { tvButton } from '@/skins/trade/ui/tv-button';
import { TV_BADGE } from '@/skins/trade/ui/tv-chip';
import { TV_MENU_ITEM, TV_POPUP } from '@/skins/trade/ui/tv-menu';

/** A button of the toolbar: 32px, quiet until it is pointed at, a clear colour while it is on. */
const flat = cn(
  tvButton({ variant: 'ghost' }),
  'h-8 gap-1.5 px-2 text-tv-ink focus-visible:ring-2 focus-visible:ring-tv-accent focus-visible:outline-none',
);
const on = 'bg-tv-hover text-tv-accent-ink';

/** A thin line between the groups of the toolbar. */
const Separator = ({ className }: { className?: string }) => (
  <span
    aria-hidden='true'
    className={cn('mx-1 h-5 w-px shrink-0 bg-tv-line', className)}
  />
);

/**
 * The chart's own buttons, in the order of a chart terminal's toolbar: the interval of the candles (1W 1M 3M 1Y), the chart type,
 * Indicators, the bar replay, then undo and redo. They go into the strip of the top toolbar (one row with the logo, the symbol search
 * and the menus). Everything that draws is in the tool rail; the range buttons, zoom and the list of shortcuts are under the chart.
 */
export function ChartToolbar({
  host,
  height,
  type,
  interval,
  replaying,
  onType,
  onInterval,
  onIndicators,
  onReplay,
}: {
  /** the empty strip of the top toolbar of the terminal; with none (the chart mounted alone) the buttons make their own strip in the chart */
  host: HTMLElement | null;
  height: number;
  type: ChartType;
  interval: Interval;
  replaying: boolean;
  onType: (type: ChartType) => void;
  onInterval: (interval: Interval) => void;
  onIndicators: () => void;
  onReplay: () => void;
}) {
  const copy = useCopy(tradeChartCopy);
  const canUndo = useChartStore((s) => s.history.past.length > 0);
  const canRedo = useChartStore((s) => s.history.future.length > 0);
  // how many indicators are on (the number on the Indicators button)
  const active = useChartStore(
    (s) => INDICATOR_IDS.filter((id) => s.indicators[id] !== 'off').length,
  );
  const buttons = (
    <>
      {/* on a phone the controls have a row of their own, so nothing needs a line before it */}
      <Separator className='max-[1100px]:hidden' />
      <div
        role='group'
        aria-label={copy.intervals.label}
        className='flex shrink-0 items-center'
      >
        {INTERVALS.map((key, k) => (
          <HintTip
            key={key}
            label={copy.intervals[key].name}
            shortcut={`Alt+${k + 1}`}
          >
            <button
              type='button'
              data-interval={key}
              aria-pressed={interval === key}
              aria-label={`${copy.intervals[key].name} (${copy.intervals[key].short})`}
              onClick={() => onInterval(key)}
              className={cn(
                flat,
                'min-w-8 px-1.5 tabular-nums pointer-coarse:min-w-11',
                interval === key && on,
              )}
            >
              {copy.intervals[key].short}
            </button>
          </HintTip>
        ))}
      </div>
      <Separator />
      <DropdownMenu>
        <HintTip label={copy.toolbar.type}>
          <DropdownMenuTrigger
            aria-label={`${copy.toolbar.type}: ${copy.types[type]}`}
            data-testid='tv-type-menu'
            className={cn(flat, 'data-popup-open:bg-tv-hover')}
          >
            <TypeIcon type={type} />
            <ChevronDown aria-hidden='true' className='size-3 opacity-60' />
          </DropdownMenuTrigger>
        </HintTip>
        <DropdownMenuContent
          align='start'
          sideOffset={6}
          className={cn('min-w-[190px]', TV_POPUP)}
        >
          <DropdownMenuRadioGroup
            value={type}
            onValueChange={(value) => onType(value as ChartType)}
          >
            {CHART_TYPES.map((key) => (
              <DropdownMenuRadioItem
                key={key}
                value={key}
                closeOnClick
                className={TV_MENU_ITEM}
              >
                <TypeIcon type={key} />
                {copy.types[key]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator />
      <HintTip label={copy.toolbar.indicators}>
        <button
          type='button'
          aria-label={
            active > 0
              ? `${copy.toolbar.indicators}: ${fill(copy.indicators.count, { count: active })}`
              : copy.toolbar.indicators
          }
          data-testid='tv-indicators-button'
          onClick={onIndicators}
          className={flat}
        >
          <ListPlus aria-hidden='true' />
          <span aria-hidden='true' className='max-[1350px]:hidden'>
            {copy.toolbar.indicators}
          </span>
          {active > 0 && (
            <span
              aria-hidden='true'
              data-testid='tv-indicators-count'
              className={TV_BADGE}
            >
              {active}
            </span>
          )}
        </button>
      </HintTip>
      <HintTip label={copy.toolbar.replay} shortcut='Shift+R'>
        <button
          type='button'
          aria-pressed={replaying}
          aria-label={copy.toolbar.replay}
          onClick={onReplay}
          className={cn(flat, replaying && on)}
        >
          <Play aria-hidden='true' />
          <span aria-hidden='true' className='max-[1350px]:hidden'>
            {copy.toolbar.replay}
          </span>
        </button>
      </HintTip>
      <Separator />
      <HintTip label={copy.tools.undo} shortcut='Ctrl+Z'>
        <button
          type='button'
          aria-label={copy.tools.undo}
          disabled={!canUndo}
          onClick={chartStore.undo}
          className={cn(flat, 'px-1.5 pointer-coarse:min-w-11')}
        >
          <Undo2 aria-hidden='true' />
        </button>
      </HintTip>
      <HintTip label={copy.tools.redo} shortcut='Shift+Ctrl+Z'>
        <button
          type='button'
          aria-label={copy.tools.redo}
          disabled={!canRedo}
          onClick={chartStore.redo}
          className={cn(flat, 'px-1.5 pointer-coarse:min-w-11')}
        >
          <Redo2 aria-hidden='true' />
        </button>
      </HintTip>
    </>
  );
  if (host) return createPortal(buttons, host);
  return (
    <div
      role='toolbar'
      aria-label={copy.toolbar.label}
      style={{ height }}
      className='absolute inset-x-0 top-0 z-[4] flex items-center gap-0.5 overflow-x-auto border-b border-tv-line bg-tv-bg px-1.5'
    >
      {buttons}
    </div>
  );
}

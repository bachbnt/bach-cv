/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Candle } from '@/skins/trade/blocks/build-candles';
import type { ChartType } from '@/skins/trade/chart/chart-types';
import type { Frame } from '@/skins/trade/chart/frame';
import type { Series } from '@/skins/trade/chart/indicators';
import {
  areaPath,
  barPaths,
  candlePaths,
  closeLine,
  linePath,
  volumePaths,
} from '@/skins/trade/chart/paths';
import {
  formatVolume,
  volumeBarWidth,
  volumeScale,
} from '@/skins/trade/chart/volume';

/** The price series as the chosen type draws it. Candles of a week are a few paths per colour, never a node each. */
export const SeriesLayer = memo(function SeriesLayer({
  type,
  series,
  baseline,
  frame,
  id,
}: {
  type: ChartType;
  series: Candle[];
  /** the level the baseline chart measures from */
  baseline: number;
  frame: Frame;
  id: string;
}) {
  const { start, end, ts, price, layout } = frame;
  const items = series.slice(start, end);
  const p = { x: ts.x, y: price.y, body: ts.body };

  if (type === 'bars') {
    const bars = barPaths(items, start, p);
    return (
      <g fill='none' strokeWidth={1.4} data-series={type}>
        <path d={bars.up} className='stroke-tv-up' />
        <path d={bars.down} className='stroke-tv-down' />
      </g>
    );
  }

  if (type === 'line') {
    return (
      <path
        d={closeLine(items, start, p)}
        fill='none'
        strokeWidth={2}
        strokeLinejoin='round'
        className='stroke-tv-accent'
        data-series={type}
      />
    );
  }

  if (type === 'area') {
    const floor = layout.main.bottom;
    return (
      <g data-series={type}>
        <defs>
          <linearGradient id={`${id}-area`} x1='0' x2='0' y1='0' y2='1'>
            <stop offset='0' stopColor='var(--tv-accent)' stopOpacity={0.32} />
            <stop offset='1' stopColor='var(--tv-accent)' stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={areaPath(items, start, p, floor)}
          fill={`url(#${id}-area)`}
          stroke='none'
        />
        <path
          d={closeLine(items, start, p)}
          fill='none'
          strokeWidth={2}
          strokeLinejoin='round'
          className='stroke-tv-accent'
        />
      </g>
    );
  }

  if (type === 'baseline') {
    const level = Math.min(
      layout.main.bottom,
      Math.max(layout.main.top, price.y(baseline)),
    );
    const line = closeLine(items, start, p);
    const fill = areaPath(items, start, p, level);
    return (
      <g data-series={type}>
        <defs>
          <clipPath id={`${id}-above`}>
            <rect x={0} y={0} width={layout.plotWidth} height={level} />
          </clipPath>
          <clipPath id={`${id}-below`}>
            <rect
              x={0}
              y={level}
              width={layout.plotWidth}
              height={layout.height}
            />
          </clipPath>
        </defs>
        <g clipPath={`url(#${id}-above)`}>
          <path d={fill} className='fill-tv-up/20' stroke='none' />
          <path
            d={line}
            fill='none'
            strokeWidth={2}
            strokeLinejoin='round'
            className='stroke-tv-up'
          />
        </g>
        <g clipPath={`url(#${id}-below)`}>
          <path d={fill} className='fill-tv-down/20' stroke='none' />
          <path
            d={line}
            fill='none'
            strokeWidth={2}
            strokeLinejoin='round'
            className='stroke-tv-down'
          />
        </g>
        <line
          x1={0}
          x2={layout.plotWidth}
          y1={level}
          y2={level}
          strokeDasharray='4 4'
          className='stroke-tv-mute'
        />
      </g>
    );
  }

  const hollow = type === 'hollow';
  const paths = candlePaths(items, start, p);
  return (
    <g data-series={type} shapeRendering='crispEdges' strokeWidth={1}>
      <path d={paths.upWick} className='stroke-tv-up' fill='none' />
      <path d={paths.downWick} className='stroke-tv-down' fill='none' />
      <path
        d={paths.upBody}
        className={
          hollow ? 'fill-none stroke-tv-up' : 'fill-tv-up stroke-tv-up'
        }
      />
      <path d={paths.downBody} className='fill-tv-down stroke-tv-down' />
    </g>
  );
});

/**
 * The volume histogram at the bottom of the price pane (a quarter of its height at most, the biggest bar on screen reaching it): the
 * bars of rising candles in the up colour and of falling ones in the down colour, a thin gap between them, the bar under the crosshair
 * brighter, and the average of 20 bars as a thin line. The bars are two paths, whatever their number.
 */
export const VolumeLayer = memo(function VolumeLayer({
  candles,
  frame,
  average,
  highlight,
}: {
  /** the real candles (the volume of a Heikin Ashi candle is the one of its week) */
  candles: Candle[];
  frame: Frame;
  /** the average of the volume (it is drawn when it has values) */
  average: Series | null;
  /** the bar under the crosshair, or `null` */
  highlight: number | null;
}) {
  const { start, end, ts, layout } = frame;
  const base = layout.main.bottom - 2;
  const width = volumeBarWidth(ts.slot);
  const scale = volumeScale(candles, start, end, base, layout.volume);
  const bars = volumePaths(
    candles.slice(start, end),
    start,
    { x: ts.x, body: width },
    base,
    layout.volume,
  );
  const line = average
    ? linePath(average, start, end, { x: ts.x, y: scale.y })
    : '';
  const lit =
    highlight !== null && highlight >= start && highlight < end
      ? candles[highlight]
      : null;
  return (
    <g data-indicator='volume' stroke='none'>
      <g opacity={0.5}>
        <path d={bars.up} className='fill-tv-up' />
        <path d={bars.down} className='fill-tv-down' />
      </g>
      {lit && highlight !== null && (
        <rect
          x={ts.x(highlight) - width / 2}
          y={scale.y(lit.v)}
          width={width}
          height={scale.h(lit.v)}
          opacity={0.95}
          className={lit.c >= lit.o ? 'fill-tv-up' : 'fill-tv-down'}
        />
      )}
      {line && (
        <path
          d={line}
          fill='none'
          strokeWidth={1}
          strokeLinejoin='round'
          className='stroke-tv-orange'
        />
      )}
    </g>
  );
});

/** The label of the last volume on the right scale, at the top of its bar, in the colour of the candle (as a chart terminal marks it). */
export const VolumeTag = memo(function VolumeTag({
  candles,
  frame,
}: {
  candles: Candle[];
  frame: Frame;
}) {
  const { start, end, layout } = frame;
  const last = candles[end - 1];
  if (!last) return null;
  const base = layout.main.bottom - 2;
  const top = volumeScale(candles, start, end, base, layout.volume).y(last.v);
  const y = Math.min(base - 7, Math.max(layout.main.top + 7, top));
  return (
    <g data-testid='tv-volume-tag' className='pointer-events-none'>
      <rect
        x={layout.plotWidth + 1}
        y={y - 7}
        width={layout.padRight - 2}
        height={14}
        rx={2}
        className={last.c >= last.o ? 'fill-tv-up' : 'fill-tv-down'}
      />
      <text
        x={layout.plotWidth + layout.padRight / 2}
        y={y + 3.5}
        textAnchor='middle'
        className='fill-white text-[10px] font-semibold tabular-nums'
      >
        {formatVolume(last.v)}
      </text>
    </g>
  );
});

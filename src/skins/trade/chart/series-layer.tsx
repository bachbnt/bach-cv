/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Candle } from '@/lib/derive/career-series';
import type { ChartType } from '@/skins/trade/chart/chart-types';
import type { Frame } from '@/skins/trade/chart/frame';
import {
  areaPath,
  barPaths,
  candlePaths,
  closeLine,
} from '@/skins/trade/chart/paths';

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

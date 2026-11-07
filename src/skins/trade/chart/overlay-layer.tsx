/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type {
  IndicatorId,
  Indicators,
  Tone,
} from '@/skins/trade/chart/chart-types';
import type { Frame } from '@/skins/trade/chart/frame';
import {
  OVERLAYS,
  type IndicatorData,
  type Series,
} from '@/skins/trade/chart/indicators';
import { bandPath, histogramPaths, linePath } from '@/skins/trade/chart/paths';

/** The stroke of a colour of the palette (the four that are mixes of two have a variable of their own, in `css/chart.css`). */
export const STROKE: Record<Tone, string> = {
  up: 'stroke-tv-up',
  down: 'stroke-tv-down',
  gold: 'stroke-tv-gold',
  sky: 'stroke-tv-sky',
  violet: 'stroke-tv-violet',
  accent: 'stroke-tv-accent',
  orange: 'stroke-tv-orange',
  lime: 'stroke-[var(--tv-ind-lime)]',
  pink: 'stroke-[var(--tv-ind-pink)]',
  teal: 'stroke-[var(--tv-ind-teal)]',
  slate: 'stroke-[var(--tv-ind-slate)]',
};

/** The stroke of the other line indicators. */
export const LINE_CLASS = {
  bollinger: STROKE.accent,
  rsi: STROKE.violet,
  macd: STROKE.accent,
  signal: STROKE.orange,
} as const;

/** A line that draws itself the first time it appears (the length is normalised to 1, so the dash animation needs no measuring). */
function Line({
  d,
  className,
  width = 1.5,
}: {
  d: string;
  className: string;
  width?: number;
}) {
  return (
    <path
      d={d}
      pathLength={1}
      fill='none'
      strokeWidth={width}
      strokeLinejoin='round'
      className={`tv-chart-line-in ${className}`}
    />
  );
}

const shown = (indicators: Indicators, id: IndicatorId) =>
  indicators[id] === 'shown';

/** The indicators drawn over the candles: the averages and the Bollinger Bands. */
export const OverlayLayer = memo(function OverlayLayer({
  frame,
  data,
  indicators,
}: {
  frame: Frame;
  data: IndicatorData;
  indicators: Indicators;
}) {
  const { start, end, ts, price } = frame;
  const p = { x: ts.x, y: price.y };
  const line = (series: Series) => linePath(series, start, end, p);
  return (
    <g>
      {shown(indicators, 'bollinger') && (
        <g data-indicator='bollinger'>
          <path
            d={bandPath(
              data.bollinger.upper,
              data.bollinger.lower,
              start,
              end,
              p,
            )}
            className='fill-tv-accent/10'
            stroke='none'
          />
          <Line
            d={line(data.bollinger.upper)}
            className={LINE_CLASS.bollinger}
            width={1}
          />
          <Line
            d={line(data.bollinger.lower)}
            className={LINE_CLASS.bollinger}
            width={1}
          />
          <Line
            d={line(data.bollinger.mid)}
            className='stroke-tv-orange'
            width={1}
          />
        </g>
      )}
      {/* the longest average first, so the short ones are drawn over it */}
      {[...OVERLAYS].reverse().map(
        (o) =>
          shown(indicators, o.id) && (
            <g key={o.id} data-indicator={o.id}>
              <Line
                d={line(data.lines[o.id])}
                className={STROKE[o.tone]}
                width={o.period === 20 ? 1.6 : 1.5}
              />
            </g>
          ),
      )}
    </g>
  );
});

/** The RSI pane: a line between 0 and 100 with the 30 to 70 band. */
export const RsiPane = memo(function RsiPane({
  frame,
  data,
}: {
  frame: Frame;
  data: IndicatorData;
}) {
  const { rsi, start, end, ts, layout } = frame;
  if (!rsi) return null;
  return (
    <g data-indicator='rsi'>
      <rect
        x={0}
        y={rsi.y(70)}
        width={layout.plotWidth}
        height={rsi.y(30) - rsi.y(70)}
        className='fill-tv-violet/10'
      />
      <Line
        d={linePath(data.rsi, start, end, { x: ts.x, y: rsi.y })}
        className={LINE_CLASS.rsi}
      />
    </g>
  );
});

/** The MACD pane: the histogram, the MACD line and its signal line around zero. */
export const MacdPane = memo(function MacdPane({
  frame,
  data,
}: {
  frame: Frame;
  data: IndicatorData;
}) {
  const { macd, start, end, ts } = frame;
  if (!macd) return null;
  const p = { x: ts.x, y: macd.y };
  const bars = histogramPaths(data.macd.histogram, start, end, {
    ...p,
    body: ts.body,
  });
  return (
    <g data-indicator='macd'>
      <g stroke='none' opacity={0.55}>
        <path d={bars.up} className='fill-tv-up' />
        <path d={bars.down} className='fill-tv-down' />
      </g>
      <Line
        d={linePath(data.macd.macd, start, end, p)}
        className={LINE_CLASS.macd}
      />
      <Line
        d={linePath(data.macd.signal, start, end, p)}
        className={LINE_CLASS.signal}
      />
    </g>
  );
});

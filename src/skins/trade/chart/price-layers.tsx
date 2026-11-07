/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Candle } from '@/skins/trade/blocks/build-candles';
import type { CursorMode } from '@/skins/trade/chart/chart-types';
import type { Frame } from '@/skins/trade/chart/frame';

/** The tag on the price scale at height `y`. */
function AxisTag({
  frame,
  y,
  text,
  className,
}: {
  frame: Frame;
  y: number;
  text: string;
  className: string;
}) {
  const { plotWidth, padRight } = frame.layout;
  return (
    <>
      <rect
        x={plotWidth}
        y={y - 9}
        width={padRight}
        height={18}
        className={className}
        stroke='none'
      />
      <text x={plotWidth + 6} y={y + 4} className='fill-white' stroke='none'>
        {text}
      </text>
    </>
  );
}

/** The dotted line at the last close, breathing. It belongs in the clipped plot; its tag is `LastPriceTag`, on the price scale. */
export const LastPriceLine = memo(function LastPriceLine({
  candle,
  frame,
}: {
  candle: Candle;
  frame: Frame;
}) {
  const { price, layout } = frame;
  const y = price.y(candle.c);
  if (y < layout.main.top || y > layout.main.bottom) return null;
  return (
    <line
      x1={0}
      x2={layout.plotWidth}
      y1={y}
      y2={y}
      strokeDasharray='1 3'
      data-last-price=''
      className={`tv-chart-pulse ${candle.c >= candle.o ? 'stroke-tv-up' : 'stroke-tv-down'}`}
    />
  );
});

/**
 * The tag of the last close on the price scale, with the word under it. It flashes every time the last candle ticks (`tick` is its
 * key, so the flash starts again).
 */
export const LastPriceTag = memo(function LastPriceTag({
  candle,
  frame,
  label,
  tick,
}: {
  candle: Candle;
  frame: Frame;
  label: string;
  tick: number;
}) {
  const { price, layout } = frame;
  const y = price.y(candle.c);
  if (y < layout.main.top || y > layout.main.bottom) return null;
  const tone =
    candle.c >= candle.o
      ? 'fill-tv-up stroke-tv-up'
      : 'fill-tv-down stroke-tv-down';
  return (
    <g className={`text-[11px] tabular-nums ${tone}`}>
      <g key={tick} className='tv-chart-flash'>
        <AxisTag
          frame={frame}
          y={y}
          text={candle.c.toFixed(2)}
          className={tone}
        />
      </g>
      <rect
        x={layout.plotWidth}
        y={y + 9}
        width={layout.padRight}
        height={16}
        opacity={0.8}
        stroke='none'
      />
      <text
        x={layout.plotWidth + 6}
        y={y + 21}
        fontSize={10}
        className='fill-white'
        stroke='none'
      >
        {label}
      </text>
    </g>
  );
});

/** The crosshair: dashed lines, the value on the price scale and the date on the time axis. Its place eases to the next bar. */
export function CrosshairLayer({
  frame,
  mode,
  x,
  y,
  priceText,
  dateText,
  pane,
}: {
  frame: Frame;
  mode: CursorMode;
  x: number;
  y: number;
  priceText: string;
  dateText: string;
  pane: { top: number; bottom: number };
}) {
  const { layout } = frame;
  const labelWidth = dateText.length * 6.4 + 16;
  const dateX = Math.min(
    layout.plotWidth - labelWidth / 2,
    Math.max(labelWidth / 2, x),
  );
  const tagY = Math.min(pane.bottom - 9, Math.max(pane.top + 9, y));
  if (mode === 'dot')
    return (
      <circle
        cx={x}
        cy={y}
        r={3.5}
        className='pointer-events-none fill-tv-ink stroke-tv-bg'
        strokeWidth={1.5}
        data-crosshair=''
      />
    );
  return (
    <g
      aria-hidden='true'
      className='pointer-events-none text-[11px] tabular-nums'
      data-crosshair=''
    >
      <g className='tv-chart-ease' style={{ transform: `translateX(${x}px)` }}>
        <line
          x1={0}
          x2={0}
          y1={layout.main.top}
          y2={layout.axisY}
          strokeDasharray='4 4'
          className='stroke-tv-mute'
        />
      </g>
      <line
        x1={0}
        x2={layout.plotWidth}
        y1={y}
        y2={y}
        strokeDasharray='4 4'
        className='stroke-tv-mute'
      />
      <AxisTag
        frame={frame}
        y={tagY}
        text={priceText}
        className='fill-tv-tip'
      />
      <g
        className='tv-chart-ease'
        style={{ transform: `translateX(${dateX}px)` }}
      >
        <rect
          x={-labelWidth / 2}
          y={layout.axisY}
          width={labelWidth}
          height={20}
          className='fill-tv-tip'
        />
        <text
          x={0}
          y={layout.axisY + 14}
          textAnchor='middle'
          className='fill-white'
        >
          {dateText}
        </text>
      </g>
    </g>
  );
}

/** The playhead of the replay: a glowing line at the bar being played and a veil over the weeks that are still hidden. */
export function PlayheadLayer({
  frame,
  index,
  phase,
}: {
  frame: Frame;
  index: number;
  phase: 'select' | 'ready';
}) {
  const { layout, ts } = frame;
  const x = ts.x(index);
  return (
    <g aria-hidden='true' className='pointer-events-none' data-playhead={phase}>
      {phase === 'ready' && (
        <rect
          x={x + ts.slot / 2}
          y={layout.main.top}
          width={Math.max(0, layout.plotWidth - x - ts.slot / 2)}
          height={layout.axisY - layout.main.top}
          className='fill-tv-hover/40'
        />
      )}
      <line
        x1={x}
        x2={x}
        y1={layout.main.top}
        y2={layout.axisY}
        strokeWidth={phase === 'ready' ? 2 : 1}
        strokeDasharray={phase === 'select' ? '3 3' : undefined}
        className={`stroke-tv-accent ${phase === 'ready' ? 'tv-chart-glow' : ''}`}
      />
    </g>
  );
}

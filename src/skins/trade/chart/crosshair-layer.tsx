/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CursorMode } from '@/skins/trade/chart/chart-types';
import type { Frame } from '@/skins/trade/chart/frame';
import { AxisTag } from '@/skins/trade/chart/axis-tag';

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

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import {
  FIB_LEVELS,
  fibPrice,
  type Drawing,
  type Point,
} from '@/skins/trade/chart/drawings';
import type { Frame } from '@/skins/trade/chart/frame';
import { Handle } from '@/skins/trade/chart/drawing-handle';

const FIB_STROKE = [
  'stroke-tv-mute',
  'stroke-tv-down',
  'stroke-tv-orange',
  'stroke-tv-up',
  'stroke-tv-sky',
  'stroke-tv-accent',
  'stroke-tv-mute',
] as const;

const FIB_FILL = [
  'fill-tv-mute/10',
  'fill-tv-down/10',
  'fill-tv-orange/10',
  'fill-tv-up/10',
  'fill-tv-sky/10',
  'fill-tv-accent/10',
  'fill-tv-mute/10',
] as const;

/** Where a line from `a` through `b` leaves the plot, for a ray. */
function farEnd(
  a: { x: number; y: number },
  b: { x: number; y: number },
  width: number,
): { x: number; y: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (dx === 0) return { x: a.x, y: dy >= 0 ? 4000 : -4000 };
  const x = dx > 0 ? width + 40 : -40;
  return { x, y: a.y + (dy / dx) * (x - a.x) };
}

/** One drawing, in the colours of the skin. A new one pops in (its width settles) and lines that were chosen show their handles. */
export const DrawingShape = memo(function DrawingShape({
  drawing,
  frame,
  selected,
  draft,
  clip,
}: {
  drawing: Drawing;
  frame: Frame;
  selected: boolean;
  draft: boolean;
  /** `url(#...)` of the clip of the price pane */
  clip: string;
}) {
  const { price, layout } = frame;
  const to = (pt: Point) => ({ x: frame.xAt(pt.t), y: price.y(pt.p) });
  const pts = drawing.points.map(to);
  const [a, b] = pts;
  const width = selected ? 2.5 : 1.5;
  const base = `tv-chart-shape${draft ? '' : ' tv-chart-pop'}`;
  const handles = selected && pts.map((pt, k) => <Handle key={k} {...pt} />);

  switch (drawing.kind) {
    case 'trend': {
      return (
        <g
          className={`${base} stroke-tv-accent`}
          strokeWidth={width}
          clipPath={clip}
          data-drawing={drawing.kind}
        >
          <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
          {handles}
        </g>
      );
    }
    case 'ray': {
      const end = farEnd(a, b, layout.plotWidth);
      return (
        <g
          className={`${base} stroke-tv-accent`}
          strokeWidth={width}
          clipPath={clip}
          data-drawing={drawing.kind}
        >
          <line x1={a.x} y1={a.y} x2={end.x} y2={end.y} />
          {handles}
        </g>
      );
    }
    case 'hline': {
      const value = drawing.points[0].p;
      return (
        <g
          className={`${base} stroke-tv-orange`}
          strokeWidth={width}
          data-drawing={drawing.kind}
        >
          <g clipPath={clip}>
            <line x1={0} y1={a.y} x2={layout.plotWidth} y2={a.y} />
          </g>
          {a.y >= layout.main.top && a.y <= layout.main.bottom && (
            <>
              <rect
                x={layout.plotWidth}
                y={a.y - 9}
                width={layout.padRight}
                height={18}
                className='fill-tv-orange'
                stroke='none'
              />
              <text
                x={layout.plotWidth + 6}
                y={a.y + 4}
                fontSize={11}
                className='fill-white tabular-nums'
                stroke='none'
              >
                {value.toFixed(2)}
              </text>
            </>
          )}
          {selected && (
            <g clipPath={clip}>
              <Handle x={layout.plotWidth / 2} y={a.y} />
            </g>
          )}
        </g>
      );
    }
    case 'vline':
      return (
        <g
          className={`${base} stroke-tv-violet`}
          strokeWidth={width}
          clipPath={clip}
          data-drawing={drawing.kind}
        >
          <line x1={a.x} y1={layout.main.top} x2={a.x} y2={layout.axisY} />
          {selected && (
            <Handle x={a.x} y={(layout.main.top + layout.axisY) / 2} />
          )}
        </g>
      );
    case 'rect':
      return (
        <g
          className={`${base} stroke-tv-accent`}
          strokeWidth={width}
          clipPath={clip}
          data-drawing={drawing.kind}
        >
          <rect
            x={Math.min(a.x, b.x)}
            y={Math.min(a.y, b.y)}
            width={Math.abs(b.x - a.x)}
            height={Math.abs(b.y - a.y)}
            className='fill-tv-accent/12'
          />
          {handles}
        </g>
      );
    case 'fib': {
      const left = Math.min(a.x, b.x);
      const right = Math.max(a.x, b.x);
      const ys = FIB_LEVELS.map((level) =>
        price.y(fibPrice(drawing.points, level)),
      );
      return (
        <g
          className={`${base} text-[11px] tabular-nums`}
          strokeWidth={selected ? 2 : 1}
          clipPath={clip}
          data-drawing={drawing.kind}
        >
          {FIB_LEVELS.slice(1).map((level, k) => (
            <rect
              key={level}
              x={left}
              y={Math.min(ys[k], ys[k + 1])}
              width={right - left}
              height={Math.abs(ys[k + 1] - ys[k])}
              className={FIB_FILL[k + 1]}
              stroke='none'
            />
          ))}
          {FIB_LEVELS.map((level, k) => (
            <g key={level}>
              <line
                x1={left}
                x2={right}
                y1={ys[k]}
                y2={ys[k]}
                className={FIB_STROKE[k]}
              />
              <text
                x={left + 4}
                y={ys[k] - 3}
                stroke='none'
                className='fill-tv-ink'
              >
                {level} ({fibPrice(drawing.points, level).toFixed(1)})
              </text>
            </g>
          ))}
          <line
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            strokeDasharray='4 4'
            className='stroke-tv-mute'
          />
          {handles}
        </g>
      );
    }
    case 'text': {
      const text = drawing.text ?? '';
      const w = text.length * 7 + 12;
      return (
        <g className={base} clipPath={clip} data-drawing={drawing.kind}>
          <rect
            x={a.x}
            y={a.y - 18}
            width={w}
            height={18}
            rx={3}
            strokeWidth={selected ? 2 : 1}
            className='fill-tv-panel stroke-tv-accent'
          />
          <text
            x={a.x + 6}
            y={a.y - 5}
            fontSize={12}
            stroke='none'
            className='fill-tv-ink'
          >
            {text}
          </text>
          {selected && <Handle x={a.x} y={a.y} />}
        </g>
      );
    }
  }
});

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Point } from '@/skins/trade/chart/drawings';
import type { Frame } from '@/skins/trade/chart/frame';

/** The box of the measure tool between its two points, blue when the index rose and red when it fell, with a line from one to the other. */
export function MeasureBox({
  a,
  b,
  frame,
}: {
  a: Point;
  b: Point;
  frame: Frame;
}) {
  const { price } = frame;
  const x1 = frame.xAt(a.t);
  const y1 = price.y(a.p);
  const x2 = frame.xAt(b.t);
  const y2 = price.y(b.p);
  const up = b.p >= a.p;
  return (
    <g
      className={`pointer-events-none ${up ? 'stroke-tv-accent' : 'stroke-tv-down'}`}
      strokeWidth={1}
      data-measure=''
    >
      <rect
        x={Math.min(x1, x2)}
        y={Math.min(y1, y2)}
        width={Math.abs(x2 - x1)}
        height={Math.abs(y2 - y1)}
        className={up ? 'fill-tv-accent/15' : 'fill-tv-down/15'}
      />
      <line x1={x1} y1={y1} x2={x2} y2={y2} strokeDasharray='4 3' />
      <circle
        cx={x2}
        cy={y2}
        r={3}
        className={up ? 'fill-tv-accent' : 'fill-tv-down'}
      />
    </g>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Frame } from '@/skins/trade/chart/frame';

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
      {phase === 'ready' && (
        // the glow is a wider copy of the line whose opacity breathes: a drop-shadow filter would repaint the whole chart every frame
        <line
          x1={x}
          x2={x}
          y1={layout.main.top}
          y2={layout.axisY}
          strokeWidth={7}
          className='tv-chart-glow stroke-tv-accent'
        />
      )}
      <line
        x1={x}
        x2={x}
        y1={layout.main.top}
        y2={layout.axisY}
        strokeWidth={phase === 'ready' ? 2 : 1}
        strokeDasharray={phase === 'select' ? '3 3' : undefined}
        className='stroke-tv-accent'
      />
    </g>
  );
}

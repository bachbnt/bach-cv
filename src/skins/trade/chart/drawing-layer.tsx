/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Drawing } from '@/skins/trade/chart/drawings';
import type { Frame } from '@/skins/trade/chart/frame';
import { DrawingShape } from '@/skins/trade/chart/drawing-shape';

/** The drawings of the visitor, over the candles, in data units: they follow every zoom and pan. They never take the pointer (the chart tests the pointer itself). */
export const DrawingLayer = memo(function DrawingLayer({
  drawings,
  draft,
  selected,
  frame,
  clip,
}: {
  drawings: Drawing[];
  draft: Drawing | null;
  selected: string | null;
  frame: Frame;
  clip: string;
}) {
  return (
    <g className='pointer-events-none' fill='none'>
      {drawings.map((drawing) => (
        <DrawingShape
          key={drawing.id}
          drawing={drawing}
          frame={frame}
          selected={drawing.id === selected}
          draft={false}
          clip={clip}
        />
      ))}
      {draft && (
        <DrawingShape
          drawing={draft}
          frame={frame}
          selected={false}
          draft
          clip={clip}
        />
      )}
    </g>
  );
});

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Frame } from '@/skins/trade/chart/frame';
import type { IndicatorData } from '@/skins/trade/chart/indicators';
import { linePath } from '@/skins/trade/chart/paths';
import { LINE_CLASS } from '@/skins/trade/chart/overlay-colors';
import { OverlayLine } from '@/skins/trade/chart/overlay-line';

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
      <OverlayLine
        d={linePath(data.rsi, start, end, { x: ts.x, y: rsi.y })}
        className={LINE_CLASS.rsi}
      />
    </g>
  );
});

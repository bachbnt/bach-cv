/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Frame } from '@/skins/trade/chart/frame';
import type { IndicatorData } from '@/skins/trade/chart/indicators';
import { histogramPaths, linePath } from '@/skins/trade/chart/paths';
import { LINE_CLASS } from '@/skins/trade/chart/overlay-colors';
import { OverlayLine } from '@/skins/trade/chart/overlay-line';

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
      <OverlayLine
        d={linePath(data.macd.macd, start, end, p)}
        className={LINE_CLASS.macd}
      />
      <OverlayLine
        d={linePath(data.macd.signal, start, end, p)}
        className={LINE_CLASS.signal}
      />
    </g>
  );
});

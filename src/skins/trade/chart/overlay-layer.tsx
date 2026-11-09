/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { IndicatorId, Indicators } from '@/skins/trade/chart/chart-types';
import type { Frame } from '@/skins/trade/chart/frame';
import {
  OVERLAYS,
  type IndicatorData,
  type Series,
} from '@/skins/trade/chart/indicators';
import { bandPath, linePath } from '@/skins/trade/chart/paths';
import { LINE_CLASS, STROKE } from '@/skins/trade/chart/overlay-colors';
import { OverlayLine } from '@/skins/trade/chart/overlay-line';

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
          <OverlayLine
            d={line(data.bollinger.upper)}
            className={LINE_CLASS.bollinger}
            width={1}
          />
          <OverlayLine
            d={line(data.bollinger.lower)}
            className={LINE_CLASS.bollinger}
            width={1}
          />
          <OverlayLine
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
              <OverlayLine
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

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import type { Frame } from '@/skins/trade/chart/frame';
import { niceTicks, type AxisLabel } from '@/skins/trade/chart/view';

const RSI_LEVELS = [30, 50, 70];

/** The price grid of every pane, the price scale on the right, the time axis and the lines between the panes. They change with the size, the window and the panes. */
export const GridLayer = memo(function GridLayer({
  frame,
  labels,
  monthName,
}: {
  frame: Frame;
  labels: AxisLabel[];
  monthName: (month: number) => string;
}) {
  const { layout, ts, price, rsi, macd } = frame;
  const { main } = layout;
  const ticks = niceTicks(
    price.priceAt(main.bottom - 4),
    price.priceAt(main.top + 4),
  );
  const rule = 'stroke-tv-grid';
  return (
    <g className='text-[11px] tabular-nums'>
      {ticks.map((value) => (
        <g key={value}>
          <line
            x1={0}
            x2={layout.plotWidth}
            y1={price.y(value)}
            y2={price.y(value)}
            className={rule}
          />
          <text
            x={layout.plotWidth + 8}
            y={price.y(value) + 4}
            className='fill-tv-mute'
          >
            {value}
          </text>
        </g>
      ))}
      {labels.map((label) => (
        <g key={label.index}>
          <line
            x1={ts.x(label.index)}
            x2={ts.x(label.index)}
            y1={main.top}
            y2={layout.axisY}
            className={rule}
          />
          <text
            x={ts.x(label.index) < 18 ? 4 : ts.x(label.index)}
            y={layout.height - 8}
            textAnchor={ts.x(label.index) < 18 ? 'start' : 'middle'}
            className={label.major ? 'fill-tv-ink font-bold' : 'fill-tv-mute'}
          >
            {label.major ? label.year : monthName(label.month)}
          </text>
        </g>
      ))}
      {rsi &&
        RSI_LEVELS.map((value) => (
          <g key={value}>
            <line
              x1={0}
              x2={layout.plotWidth}
              y1={rsi.y(value)}
              y2={rsi.y(value)}
              className={rule}
            />
            <text
              x={layout.plotWidth + 8}
              y={rsi.y(value) + 4}
              className='fill-tv-mute'
            >
              {value}
            </text>
          </g>
        ))}
      {macd && (
        <line
          x1={0}
          x2={layout.plotWidth}
          y1={macd.y(0)}
          y2={macd.y(0)}
          className={rule}
        />
      )}
      {[layout.rsi, layout.macd].map(
        (pane) =>
          pane && (
            <line
              key={pane.top}
              x1={0}
              x2={layout.width}
              y1={pane.top}
              y2={pane.top}
              className='stroke-tv-line'
            />
          ),
      )}
      <line
        x1={layout.plotWidth}
        x2={layout.plotWidth}
        y1={main.top}
        y2={layout.axisY}
        className='stroke-tv-line'
      />
      <line
        x1={0}
        x2={layout.width}
        y1={layout.axisY}
        y2={layout.axisY}
        className='stroke-tv-line'
      />
    </g>
  );
});

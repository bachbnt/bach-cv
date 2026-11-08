/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Candle } from '@/lib/derive/career-series';
import {
  OVERLAYS,
  extent,
  type IndicatorData,
  type Series,
} from '@/skins/trade/chart/indicators';
import type { TimeAxis } from '@/skins/trade/chart/time-axis';
import { isLineType } from '@/skins/trade/chart/series';
import type { ChartType, Indicators } from '@/skins/trade/chart/chart-types';
import {
  layoutOf,
  makePriceScale,
  makeTimeScale,
  visibleBars,
  type Layout,
  type PriceScale,
  type TimeScale,
  type View,
} from '@/skins/trade/chart/view';

/** Everything the layers of the chart need to put a bar, a price or an indicator value on screen for one view. */
export interface Frame {
  layout: Layout;
  view: View;
  ts: TimeScale;
  /** the time and the bar index of the interval on screen, one into the other (a drawing is kept in time) */
  axis: TimeAxis;
  /** where a time is across the plot */
  xAt: (t: number) => number;
  /** the bars on screen, `start` to `end` (not included), already cut at the playhead */
  start: number;
  end: number;
  price: PriceScale;
  rsi: PriceScale | null;
  macd: PriceScale | null;
}

interface FrameInput {
  width: number;
  height: number;
  view: View;
  axis: TimeAxis;
  /** the candles the chart type draws, cut at the playhead */
  series: Candle[];
  type: ChartType;
  indicators: Indicators;
  data: IndicatorData;
  log: boolean;
  /** the height of the strip with the chart's own buttons */
  toolbar: number;
  /** a price range chosen by dragging the price scale, or `null` to fit the candles */
  manual: { lo: number; hi: number } | null;
}

const on = (indicators: Indicators, id: keyof Indicators): boolean =>
  indicators[id] === 'shown';

/** The lines that share the price pane with the candles, for the extremes of the price scale. */
function overlays(input: FrameInput): Series[] {
  const { indicators, data } = input;
  const lists: Series[] = [];
  for (const o of OVERLAYS)
    if (on(indicators, o.id)) lists.push(data.lines[o.id]);
  if (on(indicators, 'bollinger'))
    lists.push(data.bollinger.upper, data.bollinger.lower);
  return lists;
}

export function buildFrame(input: FrameInput): Frame {
  const { view, series, indicators, data } = input;
  const layout = layoutOf(
    input.width,
    input.height,
    {
      rsi: indicators.rsi !== 'off',
      macd: indicators.macd !== 'off',
    },
    input.toolbar,
  );
  const ts = makeTimeScale(view, layout.plotWidth);
  const { start, end } = visibleBars(view, series.length);

  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  const lineOnly = isLineType(input.type);
  for (let i = start; i < end; i++) {
    const k = series[i];
    lo = Math.min(lo, lineOnly ? k.c : k.l);
    hi = Math.max(hi, lineOnly ? k.c : k.h);
  }
  const around = extent(overlays(input), start, end);
  if (around) {
    lo = Math.min(lo, around[0]);
    hi = Math.max(hi, around[1]);
  }
  if (!(lo <= hi)) {
    lo = 0;
    hi = 1;
  }
  if (hi - lo < 1e-6) hi = lo + 1;
  if (input.manual) {
    lo = input.manual.lo;
    hi = input.manual.hi;
  }

  const { main } = layout;
  const air = (main.bottom - main.top) * 0.07;
  const floor = on(indicators, 'volume') ? layout.volume * 0.75 : 0;
  const price = makePriceScale(
    lo,
    hi,
    main.top + air,
    main.bottom - air - floor,
    input.log,
  );

  let rsiScale: PriceScale | null = null;
  if (layout.rsi)
    rsiScale = makePriceScale(
      0,
      100,
      layout.rsi.top + 14,
      layout.rsi.bottom - 6,
      false,
    );
  let macdScale: PriceScale | null = null;
  if (layout.macd) {
    const e = extent(
      [data.macd.macd, data.macd.signal, data.macd.histogram],
      start,
      end,
    ) ?? [-1, 1];
    const m = Math.max(Math.abs(e[0]), Math.abs(e[1]), 0.01) * 1.15;
    macdScale = makePriceScale(
      -m,
      m,
      layout.macd.top + 14,
      layout.macd.bottom - 4,
      false,
    );
  }
  return {
    layout,
    view,
    ts,
    axis: input.axis,
    xAt: (t) => ts.x(input.axis.index(t)),
    start,
    end,
    price,
    rsi: rsiScale,
    macd: macdScale,
  };
}

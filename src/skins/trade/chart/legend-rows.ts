/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Candle } from '@/skins/trade/blocks/build-candles';
import {
  INDICATOR_IDS,
  type IndicatorId,
  type IndicatorMode,
  type Indicators,
  type Tone,
} from '@/skins/trade/chart/chart-types';
import { OVERLAYS, type IndicatorData } from '@/skins/trade/chart/indicators';

export interface LegendValue {
  value: number | null;
  tone: Tone;
}

export interface LegendRow {
  id: IndicatorId;
  mode: IndicatorMode;
  values: LegendValue[];
}

/** The indicators of the price pane come first, then the ones with a pane of their own: the order of the list of identifiers. */
const ORDER: readonly IndicatorId[] = INDICATOR_IDS;

/** The legend rows of the indicators that are on (shown or hidden), with their values at bar `index`. `candle` gives the volume of that week. */
export function legendRows(
  indicators: Indicators,
  data: IndicatorData,
  candle: Candle | null,
  index: number,
): LegendRow[] {
  const at = (list: (number | null)[]) => list[index] ?? null;
  const values = (id: IndicatorId): LegendValue[] => {
    switch (id) {
      case 'volume':
        return [
          {
            value: candle?.v ?? null,
            tone: candle && candle.c < candle.o ? 'down' : 'up',
          },
          // the average of the last 20 bars, once there are that many
          ...(at(data.volumeMa) === null
            ? []
            : [{ value: at(data.volumeMa), tone: 'orange' as const }]),
        ];
      case 'bollinger':
        return [
          { value: at(data.bollinger.mid), tone: 'orange' },
          { value: at(data.bollinger.upper), tone: 'accent' },
          { value: at(data.bollinger.lower), tone: 'accent' },
        ];
      case 'rsi':
        return [{ value: at(data.rsi), tone: 'violet' }];
      case 'macd':
        return [
          { value: at(data.macd.macd), tone: 'accent' },
          { value: at(data.macd.signal), tone: 'orange' },
          { value: at(data.macd.histogram), tone: 'up' },
        ];
      default: {
        // a moving average: its line and its colour come from the list
        const spec = OVERLAYS.find((o) => o.id === id);
        return spec
          ? [{ value: at(data.lines[spec.id]), tone: spec.tone }]
          : [];
      }
    }
  };
  return ORDER.filter((id) => indicators[id] !== 'off').map((id) => ({
    id,
    mode: indicators[id],
    values: values(id),
  }));
}

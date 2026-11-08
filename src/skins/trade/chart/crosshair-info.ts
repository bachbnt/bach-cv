/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Frame } from '@/skins/trade/chart/frame';
import type { Pane } from '@/skins/trade/chart/view';

export interface CrosshairInfo {
  /** the height of the horizontal line */
  y: number;
  /** the pane the pointer is over: its scale tells the value on the right */
  pane: 'main' | 'rsi' | 'macd';
  /** the box of that pane, which the lines of the crosshair stay inside */
  box: Pane;
  /** the value on the scale of that pane at `y`: two decimals for the index, one for an oscillator */
  priceText: string;
}

/** Where the crosshair sits and what its tag says. With no pointer height (the keyboard moved it) it sits on `close`, in the price pane. */
export function crosshairInfo(
  frame: Frame,
  pointerY: number | null,
  close: number,
): CrosshairInfo {
  const { layout, price } = frame;
  const y = pointerY ?? price.y(close);
  const pane =
    layout.rsi && y >= layout.rsi.top && y <= layout.rsi.bottom
      ? 'rsi'
      : layout.macd && y >= layout.macd.top && y <= layout.macd.bottom
        ? 'macd'
        : 'main';
  const scale =
    pane === 'rsi' ? frame.rsi : pane === 'macd' ? frame.macd : price;
  const box =
    pane === 'rsi' && layout.rsi
      ? layout.rsi
      : pane === 'macd' && layout.macd
        ? layout.macd
        : layout.main;
  return {
    y,
    pane,
    box,
    priceText: (scale ?? price).priceAt(y).toFixed(pane === 'main' ? 2 : 1),
  };
}

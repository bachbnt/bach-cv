/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Candle } from '@/skins/trade/blocks/build-candles';

/**
 * A volume as a short plain number, the same in every language: `812`, `46.3K`, `1.2M`. These are index units of a decoration (no
 * shares, no money), so there is no unit but the letter that says thousand or million.
 */
export function formatVolume(value: number): string {
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs < 1000) return `${sign}${Math.round(abs)}`;
  const units: [number, string][] = [
    [1e3, 'K'],
    [1e6, 'M'],
    [1e9, 'B'],
  ];
  let k = abs < 1e6 ? 0 : abs < 1e9 ? 1 : 2;
  let shown = Math.round((abs / units[k][0]) * 10) / 10;
  // 999.96K is 1M, not 1000K
  if (shown >= 1000 && k < units.length - 1) {
    k += 1;
    shown = Math.round((abs / units[k][0]) * 10) / 10;
  }
  return `${sign}${shown}${units[k][1]}`;
}

/**
 * The width of a volume bar: the slot of a bar less a thin gap that grows with it (a pixel at least), so that a crowded chart still
 * reads as bars and a few wide ones do not touch.
 */
export const volumeBarWidth = (slot: number): number =>
  Math.max(1, slot - Math.max(1, slot * 0.2));

/** The scale of the volume histogram: the biggest volume on screen reaches `height` pixels above `base`. */
export interface VolumeScale {
  max: number;
  /** the height of a bar, in pixels */
  h: (volume: number) => number;
  /** the y of the top of a bar */
  y: (volume: number) => number;
}

export function volumeScale(
  candles: Candle[],
  start: number,
  end: number,
  base: number,
  height: number,
): VolumeScale {
  let max = 1;
  for (let i = Math.max(0, start); i < Math.min(candles.length, end); i++)
    max = Math.max(max, candles[i].v);
  const h = (volume: number) => (volume / max) * height;
  return { max, h, y: (volume) => base - h(volume) };
}

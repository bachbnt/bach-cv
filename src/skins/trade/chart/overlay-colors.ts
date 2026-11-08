/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Tone } from '@/skins/trade/chart/chart-types';

/** The stroke of a colour of the palette (the four that are mixes of two have a variable of their own, in `css/chart.css`). */
export const STROKE: Record<Tone, string> = {
  up: 'stroke-tv-up',
  down: 'stroke-tv-down',
  gold: 'stroke-tv-gold',
  sky: 'stroke-tv-sky',
  violet: 'stroke-tv-violet',
  accent: 'stroke-tv-accent',
  orange: 'stroke-tv-orange',
  lime: 'stroke-[var(--tv-ind-lime)]',
  pink: 'stroke-[var(--tv-ind-pink)]',
  teal: 'stroke-[var(--tv-ind-teal)]',
  slate: 'stroke-[var(--tv-ind-slate)]',
};

/** The stroke of the other line indicators. */
export const LINE_CLASS = {
  bollinger: STROKE.accent,
  rsi: STROKE.violet,
  macd: STROKE.accent,
  signal: STROKE.orange,
} as const;

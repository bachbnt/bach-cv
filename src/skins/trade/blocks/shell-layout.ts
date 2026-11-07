/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * What is on screen and how it is divided: the watchlist, the bottom panel (the page), the tool rail and the ticker tape; `split` is the
 * share of the workspace the chart takes (a ratio, so it stays right when the window changes size) and `side` the width of the watchlist
 * in pixels. `null` is the usual size.
 */
export interface Layout {
  watchlist: boolean;
  panel: boolean;
  tools: boolean;
  tape: boolean;
  split: number | null;
  side: number | null;
}

export const LAYOUT_KEY = 'bach-cv-trade-layout';

export const DEFAULT_LAYOUT: Layout = {
  watchlist: true,
  panel: true,
  tools: true,
  tape: true,
  split: null,
  side: null,
};

/** The least the chart may be, and the least the page panel (a part that is too small is of no use). */
export const CHART_MIN = 220;
export const PANEL_MIN = 160;
/** The height of the range bar under the chart and of the ticker tape under it. */
export const RANGE_BAR = 32;
export const TAPE_HEIGHT = 30;
/** The width of the watchlist: the usual one and how narrow or wide it may be made. */
export const SIDE_DEFAULT = 300;
export const SIDE_MIN = 240;
export const SIDE_MAX = 480;

/** The room for the chart (its own height, in pixels) in a workspace `area` pixels high (under the toolbar): never less than `CHART_MIN`. */
export function chartBounds(
  area: number,
  tape: boolean,
): { min: number; max: number } {
  const max = area - PANEL_MIN - RANGE_BAR - (tape ? TAPE_HEIGHT : 0);
  return { min: CHART_MIN, max: Math.max(CHART_MIN, max) };
}

/** The height of the chart for a saved share of the workspace, kept inside what both parts need. */
export function chartHeight(
  split: number,
  area: number,
  tape: boolean,
): number {
  const { min, max } = chartBounds(area, tape);
  return Math.round(Math.min(max, Math.max(min, split * area)));
}

/**
 * The height the chart has until the visitor drags the divider: about a third of the window on Home (the chart is the page's hero), a
 * quarter on the other pages, always inside what both parts need.
 */
export function defaultChartHeight(
  viewport: number,
  area: number,
  tall: boolean,
  tape: boolean,
): number {
  const { min, max } = chartBounds(area, tape);
  const usual = tall
    ? Math.max(260, viewport * 0.36)
    : Math.max(170, viewport * 0.26);
  return Math.round(Math.min(max, Math.max(min, usual)));
}

/** The share of the workspace a chart of `height` pixels is. */
export const splitOf = (height: number, area: number): number =>
  area > 0 ? Math.round((height / area) * 1000) / 1000 : 0;

export const clampSide = (width: number): number =>
  Math.round(Math.min(SIDE_MAX, Math.max(SIDE_MIN, width)));

/** The saved layout; anything that is not what it should be in the saved text keeps its default, so a stale or damaged value is harmless. */
export function parseLayout(raw: string | null): Layout {
  if (!raw) return DEFAULT_LAYOUT;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return DEFAULT_LAYOUT;
    const record = data as Record<string, unknown>;
    const flag = (key: 'watchlist' | 'panel' | 'tools' | 'tape') =>
      typeof record[key] === 'boolean'
        ? (record[key] as boolean)
        : DEFAULT_LAYOUT[key];
    const split = record.split;
    const side = record.side;
    return {
      watchlist: flag('watchlist'),
      panel: flag('panel'),
      tools: flag('tools'),
      tape: flag('tape'),
      split:
        typeof split === 'number' &&
        Number.isFinite(split) &&
        split >= 0.1 &&
        split <= 0.9
          ? split
          : null,
      side:
        typeof side === 'number' && Number.isFinite(side)
          ? clampSide(side)
          : null,
    };
  } catch {
    return DEFAULT_LAYOUT;
  }
}

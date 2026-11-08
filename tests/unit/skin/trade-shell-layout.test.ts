/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  CHART_MIN,
  DEFAULT_LAYOUT,
  LAYOUT_KEY,
  PANEL_MIN,
  RANGE_BAR,
  SIDE_MAX,
  SIDE_MIN,
  TAPE_HEIGHT,
  chartBounds,
  chartHeight,
  clampSide,
  defaultChartHeight,
  parseLayout,
  splitOf,
} from '@/skins/trade/blocks/shell-layout';
import { countAt } from '@/skins/trade/shell/use-count-up';

describe('parseLayout', () => {
  it('has the key the owner named and shows everything by default', () => {
    expect(LAYOUT_KEY).toBe('bach-cv-trade-layout');
    expect(parseLayout(null)).toEqual({
      watchlist: true,
      panel: true,
      tools: true,
      tape: true,
      split: null,
      side: null,
    });
    expect(DEFAULT_LAYOUT.watchlist).toBe(true);
    expect(DEFAULT_LAYOUT.tape).toBe(true);
  });

  it('reads what was saved', () => {
    expect(
      parseLayout('{"watchlist":false,"panel":true,"tools":false}'),
    ).toEqual({
      watchlist: false,
      panel: true,
      tools: false,
      tape: true,
      split: null,
      side: null,
    });
    expect(parseLayout('{"tape":false}').tape).toBe(false);
  });

  it('keeps the default for anything that is not a boolean, and for text that is not JSON', () => {
    expect(parseLayout('{"watchlist":"no","tools":false}')).toEqual({
      watchlist: true,
      panel: true,
      tools: false,
      tape: true,
      split: null,
      side: null,
    });
    expect(parseLayout('not json')).toEqual(DEFAULT_LAYOUT);
    expect(parseLayout('42')).toEqual(DEFAULT_LAYOUT);
    expect(parseLayout('null')).toEqual(DEFAULT_LAYOUT);
  });
});

describe('the sizes in the layout', () => {
  it('are read when they are valid: a share between a tenth and nine tenths, a width inside the limits', () => {
    const saved = parseLayout('{"split":0.5,"side":380}');
    expect(saved.split).toBe(0.5);
    expect(saved.side).toBe(380);
    // a width outside the limits is brought inside them
    expect(parseLayout('{"side":100}').side).toBe(SIDE_MIN);
    expect(parseLayout('{"side":9000}').side).toBe(SIDE_MAX);
    expect(parseLayout('{"side":301.6}').side).toBe(302);
  });

  it('are ignored when they are not numbers or not a share, and the usual size is used', () => {
    for (const bad of ['"half"', 'null', '1.5', '0', '-1', '0.05', 'true'])
      expect(parseLayout(`{"split":${bad}}`).split).toBeNull();
    for (const bad of ['"wide"', 'null', 'true', '[]'])
      expect(parseLayout(`{"side":${bad}}`).side).toBeNull();
    // and a number that is not finite cannot even be written in JSON
    expect(parseLayout('{"split":1e999}').split).toBeNull();
  });
});

describe('the height of the chart', () => {
  const area = 860;

  it('leaves the chart and the page room, with and without the ticker tape', () => {
    expect(chartBounds(area, true)).toEqual({
      min: CHART_MIN,
      max: area - PANEL_MIN - RANGE_BAR - TAPE_HEIGHT,
    });
    expect(chartBounds(area, false).max).toBe(
      chartBounds(area, true).max + TAPE_HEIGHT,
    );
    // a window too small for both keeps the chart usable: it is the page that gives way
    expect(chartBounds(300, true)).toEqual({ min: CHART_MIN, max: CHART_MIN });
  });

  it('is a share of the workspace, kept inside the bounds', () => {
    expect(chartHeight(0.4, area, true)).toBe(344);
    expect(chartHeight(0.1, area, true)).toBe(CHART_MIN);
    expect(chartHeight(0.9, area, true)).toBe(chartBounds(area, true).max);
  });

  it('stays valid when the window changes size: the share is kept, the pixels follow', () => {
    const share = splitOf(602, area);
    expect(share).toBe(0.7);
    expect(chartHeight(share, 1200, true)).toBe(840);
    // in a short window the same share would leave too little for the page: it is cut at the limit
    expect(chartHeight(share, 500, true)).toBe(chartBounds(500, true).max);
    expect(chartBounds(500, true).max).toBeGreaterThanOrEqual(CHART_MIN);
    expect(splitOf(100, 0)).toBe(0);
  });

  it('has a usual height: a third of the window on Home, a quarter elsewhere', () => {
    expect(defaultChartHeight(900, 860, true, true)).toBe(324);
    expect(defaultChartHeight(900, 860, false, true)).toBe(234);
    // never outside the bounds
    expect(defaultChartHeight(400, 360, true, true)).toBe(CHART_MIN);
    expect(clampSide(300)).toBe(300);
  });
});

describe('countAt', () => {
  it('starts at 0, ends on the target and slows as it arrives', () => {
    expect(countAt(7, 0)).toBe(0);
    expect(countAt(7, 1)).toBe(7);
    expect(countAt(7, 2)).toBe(7);
    expect(countAt(7, -1)).toBe(0);
    expect(countAt(100, 0.5)).toBeGreaterThan(50);
  });

  it('only goes up on the way, and eases out (most of it is done by half time)', () => {
    const steps = Array.from({ length: 11 }, (_, i) => countAt(100, i / 10));
    expect(steps).toEqual([...steps].sort((a, b) => a - b));
    expect(countAt(100, 0.5)).toBeGreaterThan(80);
  });
});

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { toggleId } from '@/skins/trade/blocks/data-projects-model';
import { isTileKey } from '@/skins/trade/blocks/data-skill-heat-model';
import { CHART_TYPES, isChartType } from '@/skins/trade/chart/chart-types';
import { isDrawingTool } from '@/skins/trade/chart/tool-groups';
import { cssVars } from '@/skins/trade/ui/css-vars';

describe('type guards of the skin', () => {
  it('isChartType accepts exactly the chart types', () => {
    for (const type of CHART_TYPES) expect(isChartType(type)).toBe(true);
    expect(isChartType('pie')).toBe(false);
    expect(isChartType(undefined)).toBe(false);
  });

  it('isTileKey accepts the keys that move between heat tiles', () => {
    for (const key of ['ArrowLeft', 'ArrowDown', 'Home', 'End'])
      expect(isTileKey(key)).toBe(true);
    expect(isTileKey('Enter')).toBe(false);
  });

  it('isDrawingTool leaves out the cursors and the eraser', () => {
    for (const id of [
      'trend',
      'ray',
      'hline',
      'vline',
      'fib',
      'rect',
      'text',
      'measure',
    ] as const)
      expect(isDrawingTool(id)).toBe(true);
    for (const id of ['cross', 'dot', 'arrow', 'eraser'] as const)
      expect(isDrawingTool(id)).toBe(false);
  });
});

describe('toggleId', () => {
  it('adds an id that is missing and removes one that is there, keeping the type', () => {
    type Column = 'name' | 'stars';
    const once: Column[] = toggleId<Column>(['name'], 'stars');
    expect(once).toEqual(['name', 'stars']);
    expect(toggleId<Column>(once, 'name')).toEqual(['stars']);
  });
});

describe('cssVars', () => {
  it('sets custom properties next to ordinary ones', () => {
    expect(cssVars({ '--i': 3, '--c': 'red' }, { minWidth: 10 })).toEqual({
      minWidth: 10,
      '--i': 3,
      '--c': 'red',
    });
  });

  it('keeps an undefined variable out of the way', () => {
    expect(cssVars({ '--c': undefined })).toEqual({ '--c': undefined });
  });
});

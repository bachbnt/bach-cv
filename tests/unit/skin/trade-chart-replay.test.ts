/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CareerMarker } from '@/lib/derive/career-series';
import {
  DEFAULT_PREFS,
  PREFS_KEY,
  loadPrefs,
  parsePrefs,
  savePrefs,
} from '@/skins/trade/chart/chart-prefs';
import { createChartStore } from '@/skins/trade/chart/chart-store';
import { legendRows } from '@/skins/trade/chart/legend-rows';
import { computeIndicators } from '@/skins/trade/chart/indicators';
import {
  BAR_MS,
  REPLAY_OFF,
  advance,
  barsDue,
  flagsPassed,
  flagsUpTo,
} from '@/skins/trade/chart/replay';

const marker = (id: string, index: number): CareerMarker => ({
  id,
  index,
  start: 0,
  company: id,
  role: 'Dev',
  current: false,
});

/** The tests run in Node, which has no browser storage: a small one stands in, and can be made to refuse writes. */
function stubStorage(refuse = false) {
  const items = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (refuse) throw new Error('blocked');
      items.set(key, value);
    },
  };
  vi.stubGlobal('window', { localStorage });
}

afterEach(() => vi.unstubAllGlobals());

describe('replay', () => {
  it('turns time into bars at the speed, keeping what is left over', () => {
    expect(barsDue(BAR_MS, 1)).toEqual({ bars: 1, rest: 0 });
    expect(barsDue(BAR_MS, 10).bars).toBe(10);
    const slow = barsDue(BAR_MS * 0.5, 1);
    expect(slow.bars).toBe(0);
    expect(slow.rest).toBeCloseTo(BAR_MS * 0.5, 8);
    const mixed = barsDue(BAR_MS * 2.5, 3);
    expect(mixed.bars).toBe(7);
    expect(mixed.rest).toBeCloseTo((BAR_MS * 0.5) / 3, 8);
  });

  it('moves the playhead and pauses at the last bar', () => {
    const state = {
      ...REPLAY_OFF,
      phase: 'ready' as const,
      at: 5,
      playing: true,
    };
    expect(advance(state, 3, 100)).toMatchObject({ at: 8, playing: true });
    expect(advance(state, 3, 7)).toMatchObject({ at: 7, playing: false });
  });

  it('shows a flag once its first week has been played, and announces it once', () => {
    const flags = [marker('a', 0), marker('b', 40), marker('c', 90)];
    expect(flagsUpTo(flags, 39).map((m) => m.id)).toEqual(['a']);
    expect(flagsUpTo(flags, 40).map((m) => m.id)).toEqual(['a', 'b']);
    expect(flagsPassed(flags, 39, 41).map((m) => m.id)).toEqual(['b']);
    expect(flagsPassed(flags, 40, 41)).toEqual([]);
    expect(flagsPassed(flags, 0, 100).map((m) => m.id)).toEqual(['b', 'c']);
  });
});

describe('the shared chart state', () => {
  beforeEach(() => stubStorage());

  it('keeps small preferences and nothing else, under its own key', () => {
    const store = createChartStore(DEFAULT_PREFS);
    store.setType('heikin');
    store.toggleIndicator('rsi');
    store.toggleMagnet();
    store.setTool('trend');
    store.put({ id: 'x', kind: 'hline', points: [{ t: 1, p: 2 }] });
    const saved = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? '{}');
    expect(Object.keys(saved).sort()).toEqual([
      'indicators',
      'interval',
      'magnet',
      'type',
    ]);
    expect(saved.type).toBe('heikin');
    expect(saved.indicators.rsi).toBe('shown');
    expect(saved.magnet).toBe(true);
    expect(loadPrefs().type).toBe('heikin');
  });

  it('makes a drawing one step, with undo, redo, hide and clear', () => {
    const store = createChartStore(DEFAULT_PREFS);
    const d = { id: 'a', kind: 'vline' as const, points: [{ t: 3, p: 0 }] };
    store.put(d);
    store.put({ ...d, points: [{ t: 9, p: 0 }] });
    expect(store.get().history.present).toHaveLength(1);
    expect(store.get().history.present[0].points[0].t).toBe(9);
    store.undo();
    expect(store.get().history.present[0].points[0].t).toBe(3);
    store.redo();
    store.setHidden(true);
    expect(store.get().hidden).toBe(true);
    store.clear();
    expect(store.get().history.present).toEqual([]);
    store.undo();
    expect(store.get().history.present).toHaveLength(1);
    store.remove('a');
    expect(store.get().history.present).toEqual([]);
  });

  it('goes back to the cursor with a mode, and tells listeners only when something changed', () => {
    const store = createChartStore(DEFAULT_PREFS);
    let calls = 0;
    const off = store.subscribe(() => (calls += 1));
    store.setTool('fib');
    store.setCursor('dot');
    expect(store.get()).toMatchObject({ tool: 'cursor', cursor: 'dot' });
    store.publishRange('y1');
    store.publishRange('y1');
    store.publishData(300, { first: 1, last: 2 });
    store.publishData(300, { first: 1, last: 2 });
    expect(calls).toBe(4);
    off();
    store.setLog(true);
    expect(calls).toBe(4);
  });

  it('runs a replay: choose the start, step, play to the end, leave', () => {
    const store = createChartStore(DEFAULT_PREFS);
    store.publishData(10, { first: 0, last: 9 });
    store.setPlaying(true);
    expect(store.get().replay.playing).toBe(false);
    store.startReplay();
    expect(store.get().replay.phase).toBe('select');
    store.pickReplay(4);
    expect(store.get().replay).toMatchObject({
      phase: 'ready',
      at: 4,
      playing: false,
    });
    store.setSpeed(10);
    store.setPlaying(true);
    store.stepReplay(3);
    expect(store.get().replay).toMatchObject({
      at: 7,
      playing: true,
      speed: 10,
    });
    store.stepReplay(50);
    expect(store.get().replay).toMatchObject({ at: 9, playing: false });
    store.setPlaying(true);
    expect(store.get().replay.playing).toBe(false);
    store.pickReplay(99);
    expect(store.get().replay.at).toBe(9);
    store.exitReplay();
    expect(store.get().replay).toMatchObject({ phase: 'off', speed: 10 });
  });
});

describe('preferences', () => {
  it('start from the defaults and read what is stored, field by field', () => {
    expect(parsePrefs(null)).toBe(DEFAULT_PREFS);
    expect(parsePrefs('not json')).toBe(DEFAULT_PREFS);
    expect(parsePrefs('42')).toBe(DEFAULT_PREFS);
    const prefs = parsePrefs(
      JSON.stringify({
        type: 'bars',
        magnet: true,
        indicators: { macd: 'hidden', rsi: 'nonsense', ma20: 'off' },
      }),
    );
    expect(prefs.type).toBe('bars');
    expect(prefs.magnet).toBe(true);
    expect(prefs.indicators.macd).toBe('hidden');
    expect(prefs.indicators.rsi).toBe('off');
    expect(prefs.indicators.ma20).toBe('off');
    expect(prefs.indicators.volume).toBe('shown');
    expect(parsePrefs('{"type":"pie"}').type).toBe('candles');
  });

  it('survive storage that throws', () => {
    stubStorage(true);
    expect(() => savePrefs(DEFAULT_PREFS)).not.toThrow();
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });
});

describe('legend rows', () => {
  const data = computeIndicators(Array.from({ length: 60 }, (_, i) => 100 + i));
  const candle = { t: 0, o: 100, h: 102, l: 99, c: 99.5, v: 41.234 };

  it('lists only the indicators that are on, with the values at the bar', () => {
    const rows = legendRows(
      { ...DEFAULT_PREFS.indicators, bollinger: 'hidden' },
      data,
      candle,
      55,
    );
    expect(rows.map((r) => r.id)).toEqual([
      'volume',
      'ma20',
      'ema50',
      'bollinger',
    ]);
    expect(rows[0].values[0]).toEqual({ value: 41.234, tone: 'down' });
    expect(rows[1].values[0].value).toBeCloseTo(data.lines.ma20[55] ?? 0, 10);
    expect(rows[3].mode).toBe('hidden');
    expect(rows[3].values).toHaveLength(3);
  });

  it('has no value before an indicator has enough history', () => {
    const rows = legendRows(
      { ...DEFAULT_PREFS.indicators, ma50: 'shown' },
      data,
      candle,
      10,
    );
    expect(rows.find((r) => r.id === 'ma50')?.values[0].value).toBeNull();
  });
});

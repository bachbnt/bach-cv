/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { crosshairInfo } from '@/skins/trade/chart/crosshair-info';
import type { Frame } from '@/skins/trade/chart/frame';
import { guideText, type Hints } from '@/skins/trade/chart/guide-text';
import {
  layoutOf,
  makePriceScale,
  type Layout,
} from '@/skins/trade/chart/view';

const hints: Hints = {
  select: 'Pick the first bar',
  one: 'Click once',
  note: 'Click to write',
  eraser: 'Click a drawing',
  measure: 'Click the start',
  second: 'Click the end',
  first: 'Click the start of the line',
  keep: 'Esc to stop',
};
const base = {
  replay: 'off',
  tool: 'trend',
  started: false,
  measuring: false,
  sticky: false,
} as const;

describe('guideText', () => {
  it('says nothing for the plain cursor and asks for the replay start first', () => {
    expect(guideText(hints, { ...base, tool: 'cursor' })).toBe('');
    expect(guideText(hints, { ...base, tool: 'trend', replay: 'select' })).toBe(
      hints.select,
    );
  });

  it('follows the clicks of a two-point tool', () => {
    expect(guideText(hints, base)).toBe(hints.first);
    expect(guideText(hints, { ...base, started: true })).toBe(hints.second);
  });

  it('has a line of its own for one-click tools, the note and the eraser', () => {
    expect(guideText(hints, { ...base, tool: 'hline' })).toBe(hints.one);
    expect(guideText(hints, { ...base, tool: 'vline' })).toBe(hints.one);
    expect(guideText(hints, { ...base, tool: 'text' })).toBe(hints.note);
    expect(guideText(hints, { ...base, tool: 'eraser' })).toBe(hints.eraser);
  });

  it('asks for the start of the measure, then its end while the box is up', () => {
    expect(guideText(hints, { ...base, tool: 'measure' })).toBe(hints.measure);
    expect(
      guideText(hints, { ...base, tool: 'measure', measuring: true }),
    ).toBe(hints.second);
  });

  it('adds how to leave a tool that stays on, but not to an empty line', () => {
    expect(guideText(hints, { ...base, sticky: true })).toBe(
      `${hints.first} ${hints.keep}`,
    );
    expect(guideText(hints, { ...base, tool: 'cursor', sticky: true })).toBe(
      '',
    );
  });
});

describe('crosshairInfo', () => {
  const makeFrame = (layout: Layout): Frame => {
    const price = makePriceScale(
      0,
      100,
      layout.main.top,
      layout.main.bottom,
      false,
    );
    const sub = (pane: { top: number; bottom: number } | null) =>
      pane ? makePriceScale(0, 100, pane.top, pane.bottom, false) : null;
    return {
      layout,
      price,
      rsi: sub(layout.rsi),
      macd: sub(layout.macd),
    } as Frame;
  };
  const layout = layoutOf(800, 500, { rsi: true, macd: true }, 34);
  const frame = makeFrame(layout);

  it('sits on the close when the keyboard moved it (no pointer height)', () => {
    const info = crosshairInfo(frame, null, 50);
    expect(info.pane).toBe('main');
    expect(info.y).toBeCloseTo(frame.price.y(50));
    expect(info.priceText).toBe('50.00');
    expect(info.box).toBe(layout.main);
  });

  it('reads the pane under the pointer: the oscillators with one decimal', () => {
    const rsi = layout.rsi!;
    const inRsi = crosshairInfo(frame, (rsi.top + rsi.bottom) / 2, 50);
    expect(inRsi.pane).toBe('rsi');
    expect(inRsi.box).toBe(rsi);
    expect(inRsi.priceText).toBe('50.0');
    const macd = layout.macd!;
    const inMacd = crosshairInfo(frame, macd.top + 1, 50);
    expect(inMacd.pane).toBe('macd');
    expect(inMacd.box).toBe(macd);
  });
});

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  draggedHeight,
  FLICK,
  restsTall,
  SHEET_SHORT,
  SHEET_TALL,
} from '@/skins/travel/ui/sheet-snap';

const SHORT = 300;
const TALL = 600;

describe('the height of a dragged sheet', () => {
  it('follows the finger: up makes it taller, down shorter', () => {
    expect(draggedHeight(300, 100, SHORT, TALL)).toBe(400);
    expect(draggedHeight(600, -100, SHORT, TALL)).toBe(500);
  });

  it('never goes under the short height or over the tall one', () => {
    expect(draggedHeight(300, -500, SHORT, TALL)).toBe(SHORT);
    expect(draggedHeight(600, 500, SHORT, TALL)).toBe(TALL);
    expect(draggedHeight(450, 0, SHORT, TALL)).toBe(450);
  });
});

describe('where a dragged sheet comes to rest', () => {
  it('goes to the nearer height when it is let go slowly', () => {
    expect(restsTall(440, 0, SHORT, TALL)).toBe(false);
    expect(restsTall(460, 0, SHORT, TALL)).toBe(true);
    expect(restsTall(450, 0.1, SHORT, TALL)).toBe(true);
  });

  it('goes the way it was thrown when it is flicked, wherever it is let go', () => {
    expect(restsTall(320, FLICK + 0.2, SHORT, TALL)).toBe(true);
    expect(restsTall(580, -(FLICK + 0.2), SHORT, TALL)).toBe(false);
  });

  it('is not a flick under the speed that makes one', () => {
    expect(restsTall(320, FLICK - 0.05, SHORT, TALL)).toBe(false);
    expect(restsTall(580, -(FLICK - 0.05), SHORT, TALL)).toBe(true);
  });
});

describe('the two heights', () => {
  it('are a share of the map, the short one under the tall one', () => {
    expect(SHEET_SHORT).toBeGreaterThan(0);
    expect(SHEET_SHORT).toBeLessThan(SHEET_TALL);
    expect(SHEET_TALL).toBeLessThan(1);
  });

  it('are the ones the classes of the panel say', async () => {
    const { readFileSync } = await import('node:fs');
    const source = readFileSync('src/skins/travel/ui/tl-panel.tsx', 'utf8');
    expect(source).toContain(`max-md:h-[${SHEET_SHORT * 100}%]`);
    expect(source).toContain(`max-md:data-[tall]:h-[${SHEET_TALL * 100}%]`);
  });
});

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  cardSide,
  maxFame,
  placeTags,
  tagBox,
  type Tag,
} from '@/skins/travel/map/declutter';

const size = { w: 100, h: 20 };
const tag = (id: string, x: number, y: number, rank = 0): Tag => ({
  id,
  rank,
  anchor: { x, y },
  artTop: y - 100,
  size,
  prefer: 'below',
});

describe('where a name tag lies for each side', () => {
  const anchor = { x: 500, y: 300 };

  it('puts the tag under the sight, centred', () => {
    expect(tagBox(anchor, size, 1, 1, 'below', 200)).toEqual({
      x: 450,
      y: 304,
      w: 100,
      h: 20,
    });
  });

  it('puts it beside the sight, lifted, with the gap in map pixels and the size in sprite pixels', () => {
    expect(tagBox(anchor, size, 2, 0.5, 'left', 200)).toEqual({
      x: 500 - 20 - 100,
      y: 300 - 80,
      w: 100,
      h: 20,
    });
    expect(tagBox(anchor, size, 2, 0.5, 'right', 200)).toEqual({
      x: 520,
      y: 220,
      w: 100,
      h: 20,
    });
  });
});

describe('the tag over the top of a drawing', () => {
  it('stands centred above the top of the drawing', () => {
    expect(tagBox({ x: 500, y: 300 }, size, 2, 0.5, 'above', 200)).toEqual({
      x: 450,
      y: 200 - 12 - 20,
      w: 100,
      h: 20,
    });
  });
});

describe('placing the name tags so that no text lies on other text', () => {
  it('leaves tags that touch nothing on their own side', () => {
    const placed = placeTags([tag('a', 0, 0), tag('b', 0, 500)], [], 1, 1);
    expect([...placed]).toEqual([
      ['a', 'below'],
      ['b', 'below'],
    ]);
  });

  it('moves a tag that a card covers to another side instead of dropping it', () => {
    // the card lies under the sight, where the tag would be; the left side is free
    const card = { x: 450, y: 300, w: 120, h: 60 };
    const placed = placeTags([tag('a', 500, 300)], [card], 1, 1);
    expect(placed.get('a')).toBe('left');
  });

  it('takes the top of the drawing when the three sides are covered', () => {
    // cards on the sides and under the sight; the top (above y = 190) is free
    const cards = [{ x: 300, y: 210, w: 500, h: 400 }];
    expect(placeTags([tag('a', 500, 300)], cards, 1, 1).get('a')).toBe('above');
  });

  it('drops a tag that has no free side', () => {
    const wall = { x: 0, y: 0, w: 2000, h: 2000 };
    expect(placeTags([tag('a', 500, 300)], [wall], 1, 1).get('a')).toBeNull();
  });

  it('serves the more important tag first, whatever the order given', () => {
    const placed = placeTags(
      [tag('minor', 500, 300, 5), tag('major', 500, 300, 1)],
      [],
      1,
      1,
    );
    expect(placed.get('major')).toBe('below');
    expect(placed.get('minor')).toBe('left');
  });
});

describe('the side of the card of a stop', () => {
  const card = { x: 540, y: 100, w: 120, h: 40 };

  it('stays on its side when nothing is under it', () => {
    expect(cardSide('right', card, 500, [])).toBe('right');
  });

  it('goes to the other side when a drawing lies under it and the other side is free', () => {
    const drawing = { x: 560, y: 90, w: 100, h: 80 };
    expect(cardSide('right', card, 500, [drawing])).toBe('left');
    expect(cardSide('left', card, 500, [drawing])).toBe('right');
  });

  it('stays when the other side is covered as much', () => {
    const both = [
      { x: 560, y: 90, w: 100, h: 80 },
      { x: 340, y: 90, w: 100, h: 80 },
    ];
    expect(cardSide('right', card, 500, both)).toBe('right');
  });
});

describe('the names the map keeps at a zoom', () => {
  it('keeps only the best known far out and all of them close', () => {
    expect(maxFame(0.2)).toBe(1);
    expect(maxFame(0.41)).toBe(1);
    expect(maxFame(0.5)).toBe(2);
    expect(maxFame(0.69)).toBe(2);
    expect(maxFame(0.7)).toBe(3);
    expect(maxFame(2.4)).toBe(3);
  });
});

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Side = 'left' | 'right' | 'below' | 'above';

/** The sides a tag may take: the order they are tried in after its own. */
export const SIDES: readonly Side[] = ['below', 'left', 'right', 'above'];

/** How far a tag stands from the sight's anchor, in the map's own pixels (see `.tl-name` in css/map.css). */
const BELOW_GAP = 4;
const SIDE_GAP = 10;
const SIDE_LIFT = 40;
const ABOVE_GAP = 6;

/**
 * Where the tag of a sight lies on the screen for a side: `anchor` is the point the sight stands on, `size` the tag as laid out,
 * `z` the zoom of the map and `sc` the size of the sprites (the tag is scaled by `sc`, its distances are not), `artTop` the top of
 * the drawing on the screen.
 */
export function tagBox(
  anchor: { x: number; y: number },
  size: { w: number; h: number },
  z: number,
  sc: number,
  side: Side,
  artTop: number,
): Box {
  const w = size.w * sc * z;
  const h = size.h * sc * z;
  if (side === 'above')
    return { x: anchor.x - w / 2, y: artTop - ABOVE_GAP * z - h, w, h };
  if (side === 'below')
    return { x: anchor.x - w / 2, y: anchor.y + BELOW_GAP * z, w, h };
  const y = anchor.y - SIDE_LIFT * z;
  return side === 'left'
    ? { x: anchor.x - SIDE_GAP * z - w, y, w, h }
    : { x: anchor.x + SIDE_GAP * z, y, w, h };
}

export interface Tag {
  id: string;
  /** Lower is more important: it chooses its place first. */
  rank: number;
  anchor: { x: number; y: number };
  /** The top of its drawing on the screen. */
  artTop: number;
  size: { w: number; h: number };
  /** The side it is drawn on when nothing is in the way. */
  prefer: Side;
}

const overlaps = (a: Box, b: Box, gap: number): boolean =>
  a.x < b.x + b.w + gap &&
  b.x < a.x + a.w + gap &&
  a.y < b.y + b.h + gap &&
  b.y < a.y + a.h + gap;

/**
 * Where every name tag goes so that no text lies on other text: the obstacles (the cards of the stops) always stay; the tags choose
 * from the most important down, each taking its own side if it is free, else another side, and a tag with no free side is left out
 * (its place is `null`).
 */
export function placeTags(
  tags: readonly Tag[],
  obstacles: readonly Box[],
  z: number,
  sc: number,
  gap = 4,
): Map<string, Side | null> {
  const placed = new Map<string, Side | null>();
  const kept: Box[] = [];
  for (const tag of [...tags].sort((a, b) => a.rank - b.rank)) {
    const sides = [tag.prefer, ...SIDES.filter((s) => s !== tag.prefer)];
    let chosen: Side | null = null;
    for (const side of sides) {
      const box = tagBox(tag.anchor, tag.size, z, sc, side, tag.artTop);
      if (
        !obstacles.some((o) => overlaps(box, o, gap)) &&
        !kept.some((k) => overlaps(box, k, gap))
      ) {
        kept.push(box);
        chosen = side;
        break;
      }
    }
    placed.set(tag.id, chosen);
  }
  return placed;
}

const area = (a: Box, b: Box): number =>
  Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) *
  Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));

/** A card must be this much less covered on the other side before it moves (so a card does not swap sides for a small gain). */
const SWAP_GAIN = 0.7;

/**
 * The side of a stop's card (to the left or right of its pin) that covers the drawings and the other cards less. The card is the
 * same on both sides but mirrored about the pin (`centre` is the x of the pin), so only the current box is needed.
 */
export function cardSide(
  current: 'left' | 'right',
  card: Box,
  centre: number,
  covered: readonly Box[],
): 'left' | 'right' {
  const mirrored: Box = { ...card, x: 2 * centre - card.x - card.w };
  const cost = (box: Box) => covered.reduce((sum, c) => sum + area(box, c), 0);
  const here = cost(card);
  return cost(mirrored) < here * SWAP_GAIN
    ? current === 'left'
      ? 'right'
      : 'left'
    : current;
}

export const sideOf = (value: string | undefined): Side =>
  SIDES.find((side) => side === value) ?? 'below';

/**
 * How far down the names of the sights go at a zoom: the best known only while the map is far out (the names would be a crowd), then
 * the next, then all of them.
 */
export const maxFame = (z: number): 1 | 2 | 3 =>
  z < 0.42 ? 1 : z < 0.7 ? 2 : 3;

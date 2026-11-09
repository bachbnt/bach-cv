/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Label {
  id: string;
  box: Box;
  /** Lower is more important: it is kept first. */
  rank: number;
}

const overlaps = (a: Box, b: Box, gap: number): boolean =>
  a.x < b.x + b.w + gap &&
  b.x < a.x + a.w + gap &&
  a.y < b.y + b.h + gap &&
  b.y < a.y + a.h + gap;

/**
 * Which labels to leave out so that no text lies on other text: the obstacles (the cards of the stops) always stay; the labels are
 * kept from the most important down, and one that would touch an obstacle or a label already kept is dropped.
 */
export function hiddenLabels(
  labels: readonly Label[],
  obstacles: readonly Box[],
  gap = 4,
): Set<string> {
  const hidden = new Set<string>();
  const kept: Box[] = [];
  for (const label of [...labels].sort((a, b) => a.rank - b.rank)) {
    const blocked =
      obstacles.some((o) => overlaps(label.box, o, gap)) ||
      kept.some((k) => overlaps(label.box, k, gap));
    if (blocked) hidden.add(label.id);
    else kept.push(label.box);
  }
  return hidden;
}

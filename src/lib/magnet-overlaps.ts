/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** One magnetic item: where it rests (its centre and size), how far the pull has moved it, and how much it has grown. */
export interface MagnetBox {
  cx: number;
  cy: number;
  w: number;
  h: number;
  tx: number;
  ty: number;
  s: number;
}

/**
 * Keeps magnetic items from lying on top of each other. Two items that are pulled toward the same pointer from either side move
 * toward each other and can overlap; each such pair is pushed apart again, half the overlap for each, along
 * the axis that separates them at rest, until there is `gap` between them. Several passes settle a chain (three chips in a row). The rest positions never overlap, so
 * the order of a pair is taken from them: it does not flip when the pull has moved the two across each other.
 * Changes `tx` and `ty` of the boxes it is given.
 */
export function separateMagnets(boxes: MagnetBox[], gap: number, passes = 8) {
  for (let pass = 0; pass < passes; pass += 1) {
    let moved = false;
    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        const dx = b.cx + b.tx - (a.cx + a.tx);
        const dy = b.cy + b.ty - (a.cy + a.ty);
        const halfW = (a.w * a.s + b.w * b.s) / 2 + gap;
        const halfH = (a.h * a.s + b.h * b.s) / 2 + gap;
        // they only collide if they overlap on both axes
        if (halfW - Math.abs(dx) <= 0 || halfH - Math.abs(dy) <= 0) continue;
        moved = true;
        // the axis is the one that separates them at rest (side by side, or one above the other), not the one that overlaps least now
        const alongX =
          Math.abs(b.cx - a.cx) - (a.w + b.w) / 2 >=
          Math.abs(b.cy - a.cy) - (a.h + b.h) / 2;
        if (alongX) {
          const side = b.cx >= a.cx ? 1 : -1;
          const push = ((halfW - side * dx) / 2) * side;
          a.tx -= push;
          b.tx += push;
        } else {
          const side = b.cy >= a.cy ? 1 : -1;
          const push = ((halfH - side * dy) / 2) * side;
          a.ty -= push;
          b.ty += push;
        }
      }
    }
    if (!moved) return;
  }
}

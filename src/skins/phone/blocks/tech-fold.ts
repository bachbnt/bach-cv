/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Where a chip is in its list: its top and its height, in px, from the top of the list. */
export interface ChipBox {
  top: number;
  height: number;
}

export interface Fold {
  /** how tall the list is while it is folded: to the bottom of the last row that shows */
  height: number;
  /** the index of the first chip that is hidden while it is folded */
  hiddenFrom: number;
}

/**
 * How a wrapped list of chips folds to its first `rows` rows: the height that holds them, and the chip where the hidden ones begin. `null`
 * when the list has `rows` rows or fewer, so there is nothing to fold. Rows are the distinct tops, which is how a flex-wrap lays them out.
 */
export function foldOf(boxes: ChipBox[], rows: number): Fold | null {
  const tops = [...new Set(boxes.map((box) => Math.round(box.top)))].sort(
    (a, b) => a - b,
  );
  if (tops.length <= rows) return null;
  const limit = tops[rows];
  const shown = boxes.filter((box) => Math.round(box.top) < limit);
  return {
    height: Math.max(...shown.map((box) => box.top + box.height)),
    hiddenFrom: boxes.findIndex((box) => Math.round(box.top) >= limit),
  };
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export interface TreemapItem {
  id: string;
  /** the area is proportional to this; it must be above 0 */
  value: number;
}

export interface TreemapRect {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Placed extends TreemapItem {
  area: number;
}

/** The worst aspect ratio of a row of areas laid along a side of length `side`. */
const worst = (row: number[], side: number): number => {
  const sum = row.reduce((a, b) => a + b, 0);
  const max = Math.max(...row);
  const min = Math.min(...row);
  return Math.max(
    (side * side * max) / (sum * sum),
    (sum * sum) / (side * side * min),
  );
};

/**
 * A squarified treemap (Bruls, Huizing and van Wijk): every item gets a rectangle whose area is its share of `width` x `height`, and
 * the rectangles are as square as the values allow. The biggest comes first; equal values keep their order, so the layout is stable.
 */
export function layoutTreemap(
  items: TreemapItem[],
  width: number,
  height: number,
): TreemapRect[] {
  const valid = items.filter((item) => item.value > 0);
  const total = valid.reduce((sum, item) => sum + item.value, 0);
  if (valid.length === 0 || total <= 0 || width <= 0 || height <= 0) return [];
  const queue: Placed[] = valid
    .map((item, index) => ({ item, index }))
    .sort((a, b) => b.item.value - a.item.value || a.index - b.index)
    .map(({ item }) => ({
      ...item,
      area: (item.value / total) * width * height,
    }));

  const out: TreemapRect[] = [];
  let x = 0;
  let y = 0;
  let w = width;
  let h = height;

  const place = (row: Placed[]) => {
    const sum = row.reduce((a, b) => a + b.area, 0);
    if (w >= h) {
      const column = sum / h;
      let top = y;
      for (const item of row) {
        const cell = item.area / column;
        out.push({ id: item.id, x, y: top, w: column, h: cell });
        top += cell;
      }
      x += column;
      w -= column;
    } else {
      const strip = sum / w;
      let left = x;
      for (const item of row) {
        const cell = item.area / strip;
        out.push({ id: item.id, x: left, y, w: cell, h: strip });
        left += cell;
      }
      y += strip;
      h -= strip;
    }
  };

  let row: Placed[] = [];
  while (queue.length) {
    const next = queue[0];
    const side = Math.min(w, h);
    const areas = row.map((r) => r.area);
    if (
      row.length === 0 ||
      worst([...areas, next.area], side) <= worst(areas, side)
    ) {
      row.push(next);
      queue.shift();
    } else {
      place(row);
      row = [];
    }
  }
  if (row.length) place(row);
  return out;
}

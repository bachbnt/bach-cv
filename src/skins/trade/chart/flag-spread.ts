/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * Where the flags stand across the plot. A flag that would touch the one before it (closer than `step`) joins its group, and a group is
 * spread evenly around its middle, one `step` apart, so no flag hides another (two flags on the same bar, or on bars a pixel or two
 * apart, as they are when the chart is zoomed out). Every position is kept whole inside `[step / 2, width - step / 2]`.
 * Returns the positions in the order of `wanted`.
 */
export function spreadFlags(
  wanted: number[],
  step: number,
  width: number,
): number[] {
  const low = step / 2;
  const high = Math.max(low, width - step / 2);
  const order = wanted
    .map((x, at) => ({ at, x: Math.min(high, Math.max(low, x)) }))
    .sort((a, b) => a.x - b.x || a.at - b.at);
  const out = new Array<number>(wanted.length);
  let from = 0;
  while (from < order.length) {
    let to = from + 1;
    while (to < order.length && order[to].x - order[to - 1].x < step) to++;
    const group = order.slice(from, to);
    const middle = group.reduce((sum, item) => sum + item.x, 0) / group.length;
    // the group is as wide as its flags need, and stays inside the plot
    const span = (group.length - 1) * step;
    const start = Math.min(high - span, Math.max(low, middle - span / 2));
    group.forEach((item, k) => {
      out[item.at] = start + k * step;
    });
    from = to;
  }
  return out;
}

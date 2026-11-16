/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A box in the px of the viewport. */
export interface ClipBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * The `clip-path` that keeps a view transition inside a display: the pseudo-elements of a view transition are painted over the whole viewport
 * and not clipped by the rounded, clipping display they are about, so the page change is cut to its box and its four corners (top left, top
 * right, bottom right, bottom left, in px).
 */
export function vtClip(
  box: ClipBox,
  viewport: { width: number; height: number },
  radii: [number, number, number, number],
): string {
  const px = (value: number) => `${Math.round(value * 100) / 100}px`;
  return `inset(${px(box.top)} ${px(viewport.width - box.right)} ${px(viewport.height - box.bottom)} ${px(box.left)} round ${radii.map(px).join(' ')})`;
}

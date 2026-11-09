/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A curl of steam that rises and fades (`tl-steam`, see css/sprites.css). */
export function Steam({
  x,
  y,
  delay,
}: {
  x: number;
  y: number;
  delay: 0 | 1 | 2;
}) {
  return (
    <path
      d={`M${x} ${y} q-6 -8 0 -15 q6 -7 0 -15`}
      className={`tl-steam tl-steam-${delay} fill-none stroke-tl-foam`}
      strokeWidth={3}
      strokeLinecap='round'
    />
  );
}

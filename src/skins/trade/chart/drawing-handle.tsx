/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

export function Handle({ x, y }: { x: number; y: number }) {
  return (
    <circle
      cx={x}
      cy={y}
      r={4.5}
      strokeWidth={2}
      className='fill-tv-bg stroke-tv-accent'
    />
  );
}

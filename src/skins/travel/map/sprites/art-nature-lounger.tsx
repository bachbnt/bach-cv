/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A sun lounger lying along the lit direction; `cushion` is a `fill-tl-*` class. */
export function Lounger({
  x,
  y,
  cushion,
}: {
  x: number;
  y: number;
  cushion: string;
}) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d='M-1 0 L9 5 L9 7 L-1 2z' className='fill-tl-trunk' />
      <path d='M-1 0 L9 5 L12 3.6 L2 -1.4z' className={cushion} />
      <path d='M-1 0 L-4 -4.4 L-0.6 -6 L2 -1.4z' className={cushion} />
      <path
        d='M-4 -4.4 L-0.6 -6'
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.6}
        strokeWidth={0.8}
      />
    </g>
  );
}

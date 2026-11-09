/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A rope-and-plank footbridge across a pool: planks on a slight sag, a hand rope on posts and a few hangers. */
export function RopeBridge({
  x1,
  x2,
  y,
}: {
  x1: number;
  x2: number;
  y: number;
}) {
  const mid = (x1 + x2) / 2;
  const hangers = [0.25, 0.5, 0.75]
    .map((k) => {
      const x = x1 + (x2 - x1) * k;
      const sag = 4 * 2 * k * (1 - k); // the sag of the quadratic at k
      return `M${x} ${y - 8 + sag * 0.5} V${y + sag * 0.5 - 1}`;
    })
    .join(' ');
  return (
    <g>
      <path
        d={`M${x1} ${y} Q${mid} ${y + 5} ${x2} ${y}`}
        className='fill-none stroke-tl-trunk'
        strokeWidth={3.4}
        strokeDasharray='3.2 0.8'
      />
      <path
        d={`M${x1} ${y - 8} Q${mid} ${y - 3} ${x2} ${y - 8}`}
        className='fill-none stroke-tl-trunk'
        strokeWidth={0.9}
      />
      <path
        d={hangers}
        className='fill-none stroke-tl-trunk'
        strokeOpacity={0.7}
        strokeWidth={0.6}
      />
      <path
        d={`M${x1} ${y - 10} V${y + 3} M${x2} ${y - 10} V${y + 3}`}
        className='fill-none stroke-tl-soil-2'
        strokeWidth={2}
        strokeLinecap='round'
      />
    </g>
  );
}

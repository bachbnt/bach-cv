/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A plank walkway on posts running down to the right (`dir` 1) or to the left (-1) at the isometric slope. */
export function Jetty({
  x,
  y,
  len,
  dir = 1,
  w = 4,
}: {
  x: number;
  y: number;
  len: number;
  dir?: 1 | -1;
  w?: number;
}) {
  const ax = dir * len;
  const ay = len / 2;
  const bx = -dir * w;
  const by = w / 2;
  const steps = Math.round(len / 5);
  const along = Array.from({ length: steps + 1 }, (_, i) => i / steps);
  const planks = along
    .slice(1, -1)
    .map((t) => `M${x + ax * t} ${y + ay * t}l${bx} ${by}`)
    .join('');
  const posts = along
    .filter((_, i) => i % 2 === 0)
    .map((t) => `M${x + bx + ax * t} ${y + by + ay * t + 2}v6`)
    .join('');
  return (
    <g>
      <path
        d={posts}
        className='fill-none stroke-tl-trunk'
        strokeWidth={1.6}
        strokeLinecap='round'
      />
      <path
        d={`M${x + bx} ${y + by}l${ax} ${ay}v2.4l${-ax} ${-ay}z`}
        className='fill-tl-trunk'
      />
      <path
        d={`M${x} ${y}l${ax} ${ay}l${bx} ${by}l${-ax} ${-ay}z`}
        className='fill-tl-soil'
      />
      <path
        d={planks}
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.4}
        strokeWidth={0.8}
      />
    </g>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { fmt } from '@/skins/travel/map/sprites/art-town-math';

/**
 * A whale skeleton hung over a plinth (the Institute keeps a real one). It lies along the left-face direction of the isometric
 * grid: (x, y) is the tail end at the top of the plinth, `length` the width it covers.
 */
export function WhaleSkeleton({
  x,
  y,
  length,
}: {
  x: number;
  y: number;
  length: number;
}) {
  const at = (s: number, up: number) => [
    fmt(x + length * s),
    fmt(y + length * s * 0.5 - up - 2.2 * Math.sin(Math.PI * s)),
  ];
  const spine = Array.from({ length: 9 }, (_, i) => {
    const [px, py] = at(i / 8, 10);
    return `${i === 0 ? 'M' : 'L'}${px} ${py}`;
  }).join('');
  const ribs = [0.2, 0.28, 0.36, 0.44, 0.52, 0.6]
    .map((s, i) => {
      const [px, py] = at(s, 10);
      const drop = 8.5 - Math.abs(i - 2.5) * 1.1;
      return `M${px} ${py}q2.6 ${fmt(drop * 0.55)} 0.4 ${fmt(drop)}`;
    })
    .join('');
  const [hx, hy] = at(0.66, 10);
  const [t0x, t0y] = at(0, 10);
  const foot = (s: number) => [fmt(x + length * s), fmt(y + length * s * 0.5)];
  const [p1x, p1y] = foot(0.3);
  const [p2x, p2y] = foot(0.58);
  const [s1x, s1y] = at(0.3, 10);
  const [s2x, s2y] = at(0.58, 10);
  return (
    <g>
      <path
        d={`M${p1x} ${p1y}L${s1x} ${s1y}M${p2x} ${p2y}L${s2x} ${s2y}`}
        className='fill-none stroke-tl-soil-2'
        strokeWidth={0.9}
        strokeOpacity={0.6}
      />
      <g transform='translate(0.8 1.2)' opacity={0.4}>
        <path
          d={spine + ribs}
          className='fill-none stroke-tl-soil-2'
          strokeWidth={1.6}
          strokeLinecap='round'
        />
      </g>
      <path
        d={spine}
        className='fill-none stroke-tl-paper'
        strokeWidth={2.2}
        strokeLinecap='round'
        strokeDasharray='2.6 0.9'
      />
      <path
        d={ribs}
        className='fill-none stroke-tl-paper'
        strokeWidth={1.1}
        strokeLinecap='round'
      />
      <path
        d={`M${t0x} ${t0y}l-4.5 -3M${t0x} ${t0y}l-2.4 3.6`}
        className='fill-none stroke-tl-paper'
        strokeWidth={1.6}
        strokeLinecap='round'
      />
      <g transform={`translate(${hx} ${hy})`}>
        <path
          d='M0 -3.2L14 4.4L16 6.6L14 8.4L1 4.4z'
          className='fill-tl-paper stroke-tl-soil-2'
          strokeWidth={0.5}
          strokeOpacity={0.5}
          strokeLinejoin='round'
        />
        <path
          d='M2.4 3.6L14.4 7.8'
          className='fill-none stroke-tl-soil-2'
          strokeWidth={0.6}
          strokeOpacity={0.5}
        />
        <circle cx={5} cy={0.8} r={0.9} className='fill-tl-soil-2' />
      </g>
    </g>
  );
}

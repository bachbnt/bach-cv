/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** A steel lattice pylon on a concrete foot. Its crossarm carries two sheave wheels; the cable leaves from (x, y - h). */
export function Pylon({ x, y, h }: { x: number; y: number; h: number }) {
  const top = y - h;
  const braces = [0.2, 0.42, 0.64, 0.84]
    .map((k, i, all) => {
      const yy = y - h * k;
      const w = 12 - 7 * k;
      const prev = i === 0 ? y : y - h * all[i - 1];
      const pw = 12 - 7 * (i === 0 ? 0 : all[i - 1]);
      return `M${x - pw} ${prev} L${x + w} ${yy} M${x + pw} ${prev} L${x - w} ${yy} M${x - w} ${yy} H${x + w}`;
    })
    .join(' ');
  return (
    <g>
      <rect
        x={x - 15}
        y={y - 3}
        width={30}
        height={4.4}
        rx={1.2}
        className='fill-tl-stone'
      />
      <rect
        x={x - 15}
        y={y - 3}
        width={30}
        height={1.4}
        rx={0.7}
        className='fill-tl-foam'
        opacity={0.35}
      />
      <path
        d={`M${x - 12} ${y - 2} L${x - 4.6} ${top + 2} M${x + 12} ${y - 2} L${x + 4.6} ${top + 2}`}
        className='fill-none stroke-tl-rock'
        strokeWidth={2.2}
        strokeLinecap='round'
      />
      <path
        d={`M${x - 12} ${y - 2} L${x - 4.6} ${top + 2}`}
        className='fill-none stroke-tl-rock-2'
        strokeWidth={0.9}
        strokeLinecap='round'
      />
      <path
        d={braces}
        className='fill-none stroke-tl-rock'
        strokeWidth={0.9}
        strokeLinejoin='round'
      />
      <path
        d={`M${x - 9} ${top + 7} H${x + 9} M${x - 7.4} ${top + 12} H${x + 7.4}`}
        className='fill-none stroke-tl-coral'
        strokeWidth={1.6}
      />
      <rect
        x={x - 13}
        y={top - 2.6}
        width={26}
        height={4}
        rx={1.2}
        className='fill-tl-rock'
      />
      <rect
        x={x - 13}
        y={top - 2.6}
        width={26}
        height={1.4}
        rx={0.7}
        className='fill-tl-rock-2'
      />
      <circle
        cx={x - 6}
        cy={top - 4}
        r={3.2}
        className='fill-none stroke-tl-rock-2'
        strokeWidth={1.6}
      />
      <circle
        cx={x + 6}
        cy={top - 4}
        r={3.2}
        className='fill-none stroke-tl-rock-2'
        strokeWidth={1.6}
      />
      <path
        d={`M${x - 6} ${top - 7.2} V${top - 0.8} M${x + 6} ${top - 7.2} V${top - 0.8}`}
        className='fill-none stroke-tl-rock'
        strokeWidth={0.7}
      />
    </g>
  );
}

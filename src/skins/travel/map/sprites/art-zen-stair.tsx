/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

const WAY =
  'M50 148 Q72 144 72 134 Q70 124 48 119 Q42 112 68 105 Q74 96 52 90 Q50 82 70 78 Q76 72 62 70';

/** The stone stair of the monastery: it winds back and forth up the lit face of the peak, a pale band of steps between low walls. */
export function MountainStair() {
  return (
    <g>
      <path
        d={WAY}
        className='fill-none stroke-tl-rock'
        strokeWidth={4.6}
        strokeLinecap='round'
        strokeLinejoin='round'
        opacity={0.6}
      />
      <path
        d={WAY}
        className='fill-none stroke-tl-wall'
        strokeWidth={3}
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d={WAY}
        className='fill-none stroke-tl-soil-2'
        strokeWidth={3}
        strokeLinejoin='round'
        strokeDasharray='0.5 1.7'
        opacity={0.35}
      />
    </g>
  );
}

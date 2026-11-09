/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK, WASH_LIGHT } from '@/skins/travel/map/sprites/art-parts';

const PETALS = [-15, -7.5, 0, 7.5, 15].map((x) => ({
  x,
  dy: 4.6 * Math.sqrt(1 - (x / 21) ** 2) - 0.4,
}));

/**
 * The great white seated Buddha of Long Son: a lotus pedestal, folded legs, hands in the lap, a round head with a bun and a halo.
 * Origin on the middle of the pedestal; about 60 high at scale 1.
 */
export function SeatedBuddha({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx={0} cy={-49} r={15} className='fill-tl-sun' opacity={0.26} />
      <circle
        cx={0}
        cy={-49}
        r={15}
        className='fill-none stroke-tl-sun'
        strokeWidth={1}
        opacity={0.7}
      />
      <ellipse cx={0} cy={3.5} rx={26} ry={7.5} className='fill-tl-stone' />
      <ellipse cx={0} cy={1} rx={26} ry={7.5} className='fill-tl-wall' />
      <ellipse
        cx={0}
        cy={1}
        rx={26}
        ry={7.5}
        className={WASH_LIGHT}
        opacity={0.35}
      />
      <ellipse cx={0} cy={-1} rx={21} ry={5.4} className='fill-tl-coral-2' />
      {PETALS.map(({ x: px, dy }) => (
        <path
          key={px}
          d={`M${px - 3.6} ${dy} q3.6 -9 7.2 0z`}
          className='fill-tl-wall stroke-tl-coral'
          strokeWidth={0.7}
          strokeOpacity={0.75}
          strokeLinejoin='round'
        />
      ))}
      <path
        d='M-22 -6 C-23 -15 -12 -19 0 -19 C12 -19 23 -15 22 -6 C12 -2 -12 -2 -22 -6z'
        className='fill-tl-wall'
      />
      <path
        d='M-11 -17 C-13 -28 -12 -37 -7 -41 C-3 -43 3 -43 7 -41 C12 -37 13 -28 11 -17z'
        className='fill-tl-wall'
      />
      <path
        d='M-7 -41 C-16 -35 -18 -24 -14 -14 C-11 -12 -6 -13 -4 -16 C-9 -21 -9 -31 -4 -38z'
        className='fill-tl-wall'
      />
      <path
        d='M7 -41 C16 -35 18 -24 14 -14 C11 -12 6 -13 4 -16 C9 -21 9 -31 4 -38z'
        className='fill-tl-wall'
      />
      <path
        d='M0 -43 C9 -43 13 -35 12 -27 C12 -20 11 -17 11 -17 L2 -17z M2 -19 C12 -18 22 -15 21 -6 C14 -2 6 -2 2 -2z M7 -41 C16 -35 18 -24 14 -14 C11 -12 6 -13 4 -16 C9 -21 9 -31 4 -38z'
        className={WASH_DARK}
        opacity={0.2}
      />
      <ellipse cx={0} cy={-13} rx={6.4} ry={2.6} className='fill-tl-wall' />
      <path
        d='M-6.4 -13 a6.4 2.6 0 0 0 12.8 0 M-8 -34 C-12 -28 -12 -20 -9 -15 M8 -34 C12 -28 12 -20 9 -15 M-6 -41 q6 4 12 0'
        className='fill-none stroke-tl-soil-2'
        strokeOpacity={0.3}
        strokeWidth={0.8}
        strokeLinecap='round'
      />
      <ellipse cx={-6.6} cy={-48} rx={1.3} ry={3.2} className='fill-tl-wall' />
      <ellipse cx={6.6} cy={-48} rx={1.3} ry={3.2} className='fill-tl-wall' />
      <circle cx={0} cy={-49} r={6.6} className='fill-tl-wall' />
      <path
        d='M0 -55.6 A6.6 6.6 0 0 1 0 -42.4 C3.6 -46 3.6 -52 0 -55.6z'
        className={WASH_DARK}
        opacity={0.22}
      />
      <circle cx={0} cy={-56.4} r={2.6} className='fill-tl-wall' />
      <path
        d='M-3.6 -49 q1.4 1 2.8 0 M0.8 -49 q1.4 1 2.8 0 M-0.6 -45.6 q0.6 0.5 1.2 0'
        className='fill-none stroke-tl-soil-2'
        strokeWidth={0.7}
        strokeLinecap='round'
        opacity={0.6}
      />
    </g>
  );
}

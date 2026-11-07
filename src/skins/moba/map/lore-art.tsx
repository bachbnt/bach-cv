/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { refOf } from '@/skins/moba/map/art-ids';

/** The lore stone (About): a carved tablet on a diamond plate, with an orb above it and four lamps. */
export function LoreArt({ p }: { p: string }) {
  return (
    <g>
      <circle
        r='80'
        fill={refOf(p, 'glow-teal')}
        opacity='0.4'
        className='mb-pulse'
      />
      <ellipse cx='7' cy='22' rx='52' ry='17' fill={refOf(p, 'shade')} />
      <g transform='rotate(45)'>
        <rect
          x='-34'
          y='-34'
          width='68'
          height='68'
          rx='6'
          fill='var(--mb-m-lane-edge)'
          stroke='var(--mb-gold-lo)'
          strokeWidth='2.5'
        />
        <rect
          x='-28'
          y='-28'
          width='56'
          height='56'
          rx='4'
          fill={refOf(p, 'stone')}
        />
        <rect
          x='-28'
          y='-28'
          width='56'
          height='56'
          rx='4'
          fill='none'
          stroke='var(--mb-gold)'
          strokeOpacity='0.55'
          strokeDasharray='2 6'
        />
      </g>
      <rect
        x='-12'
        y='-22'
        width='24'
        height='42'
        rx='5'
        fill='var(--mb-m-rock-2)'
        stroke='var(--mb-gold-lo)'
        strokeWidth='2'
      />
      <rect
        x='-12'
        y='-22'
        width='9'
        height='42'
        rx='4'
        fill='var(--mb-m-rock-1)'
      />
      <path
        d='M-5 -12 H5 M-5 -4 H5 M-5 4 H5 M0 -12 V12'
        stroke='var(--mb-teal)'
        strokeWidth='1.6'
        strokeLinecap='round'
      />
      <circle
        cy='-30'
        r='6.5'
        fill='var(--mb-teal)'
        stroke='var(--mb-gold-hi)'
        strokeOpacity='0.8'
        strokeWidth='1.2'
        className='mb-float'
      />
      {[
        [-46, 0],
        [46, 0],
        [0, -46],
        [0, 46],
      ].map(([x, y]) => (
        <g key={`${x}${y}`} transform={`translate(${x} ${y})`}>
          <circle r='11' fill={refOf(p, 'glow-teal')} />
          <circle r='2.8' fill='var(--mb-gold-hi)' />
        </g>
      ))}
    </g>
  );
}

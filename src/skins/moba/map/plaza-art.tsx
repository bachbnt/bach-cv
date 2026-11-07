/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { refOf } from '@/skins/moba/map/art-ids';
import { hexPath } from '@/skins/moba/world/shapes';

/** The plaza on the bridge where the mid lane crosses the river (Resume): a round stone floor with a gold compass in it. */
export function PlazaArt({ p, full }: { p: string; full: boolean }) {
  return (
    <g>
      <circle
        r='96'
        fill={refOf(p, 'glow-gold')}
        opacity='0.3'
        className='mb-pulse'
      />
      <circle r='72' fill='#000' fillOpacity='0.4' />
      <circle
        r='66'
        fill='var(--mb-m-lane-edge)'
        stroke='var(--mb-gold-lo)'
        strokeWidth='3'
      />
      <circle r='58' fill={refOf(p, 'lane')} />
      {full && <circle r='58' fill={refOf(p, 'hex')} opacity='0.45' />}
      <circle
        r='50'
        fill='none'
        stroke='var(--mb-gold)'
        strokeOpacity='0.7'
        strokeWidth='1.6'
        strokeDasharray='2 7'
        strokeLinecap='round'
      />
      <path
        d={hexPath({ x: 0, y: 0 }, 34, Math.PI / 6)}
        fill='none'
        stroke='var(--mb-gold)'
        strokeOpacity='0.75'
        strokeWidth='1.8'
      />
      <path
        d='M0 -40 L7 -7 L40 0 L7 7 L0 40 L-7 7 L-40 0 L-7 -7Z'
        fill='var(--mb-gold)'
        fillOpacity='0.55'
        stroke='var(--mb-gold-hi)'
        strokeOpacity='0.8'
        strokeWidth='1.3'
      />
      <circle r='6' fill='var(--mb-gold-hi)' />
      {[45, 135, 225, 315].map((a) => (
        <g key={a} transform={`rotate(${a}) translate(0 -64)`}>
          <rect
            x='-5'
            y='-5'
            width='10'
            height='10'
            rx='2'
            fill='var(--mb-m-rock-2)'
            stroke='var(--mb-gold-lo)'
            strokeWidth='1.5'
          />
        </g>
      ))}
    </g>
  );
}

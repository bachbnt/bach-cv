/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { WASH_DARK } from '@/skins/travel/map/sprites/art-parts';

/** The shore is a line running up to the right at the isometric slope, the sea lies below it. */
const SHORE = 'M44 160L154 104';

const SEA = 'M44 160L152 104C161 112 160 132 146 146C128 160 88 162 44 160z';
const LAND = 'M4 108C-4 134 20 154 44 160L160 102L156 96Q80 96 4 108z';
const RIM = 'M-2 122C0 140 22 156 44 160V164C20 160 -2 146 -2 128z';
const BEACH = 'M30 156C34 158 38 160 44 160L160 102V110L54 162Q40 162 30 156z';

/** The land under the village: grass and a sand beach along the shoreline, with the shallow sea in front of it. */
export function Shore() {
  return (
    <g>
      <defs>
        <linearGradient id='tl-ro-sea' x1='0' y1='0' x2='1' y2='1'>
          <stop offset='0' style={{ stopColor: 'var(--tl-sea-1)' }} />
          <stop offset='1' style={{ stopColor: 'var(--tl-sea-2)' }} />
        </linearGradient>
      </defs>
      <path d={SEA} fill='url(#tl-ro-sea)' />
      <path
        d={SEA}
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.8}
        strokeWidth={1.6}
        strokeLinejoin='round'
      />
      <path
        d='M66 160L106 140M96 158L134 138M118 152L148 134'
        className='fill-none stroke-tl-foam'
        strokeOpacity={0.55}
        strokeWidth={0.9}
        strokeLinecap='round'
        strokeDasharray='6 5'
      />
      <path d={RIM} className='fill-tl-sand-2' />
      <path d={LAND} className='fill-tl-land-1' />
      <path d={LAND} className={WASH_DARK} opacity={0.08} />
      <path d={BEACH} className='fill-tl-sand' />
      <path
        d={SHORE}
        className='fill-none stroke-tl-foam'
        strokeWidth={1.6}
        strokeLinecap='round'
        strokeOpacity={0.9}
      />
    </g>
  );
}

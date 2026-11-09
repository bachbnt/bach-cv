/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { GROUND, LIFT } from '@/skins/travel/map/layers/ground';
import { WORLD } from '@/skins/travel/map/iso';

/** The foam along the shore, a layer of its own so that it can breathe (an opacity animation the compositor does) without the sea being drawn again. */
export const Shore = memo(function Shore() {
  return (
    <svg
      aria-hidden='true'
      focusable='false'
      width={WORLD.width}
      height={WORLD.height}
      viewBox={`0 0 ${WORLD.width} ${WORLD.height}`}
      className='tl-shore tl-ground absolute top-0 left-0 block overflow-visible'
    >
      <g clipPath='url(#tl-slab-clip)'>
        <g transform={`translate(0 ${LIFT}) ${GROUND}`}>
          <use
            href='#tl-land'
            className='fill-none stroke-tl-foam'
            strokeWidth={18}
            strokeOpacity={0.3}
            strokeLinejoin='round'
          />
          <use
            href='#tl-land'
            className='fill-none stroke-tl-foam'
            strokeWidth={6}
            strokeOpacity={0.9}
          />
        </g>
      </g>
    </svg>
  );
});

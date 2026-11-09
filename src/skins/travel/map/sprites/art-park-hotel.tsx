/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Box,
  OnFace,
  type BoxShape,
} from '@/skins/travel/map/sprites/art-parts';

/** The resort hotel in the back: a tall slim tower with rows of windows and a stepped crown. */
export function HotelTower({ cx, y }: { cx: number; y: number }) {
  const body: BoxShape = { cx, y, wl: 9, wr: 11, h: 66 };
  const crown: BoxShape = { cx: cx + 1, y: y - 66, wl: 6, wr: 7, h: 6 };
  return (
    <g>
      <Box
        shape={body}
        wall='fill-tl-bldg-l'
        top='fill-tl-bldg-top'
        shade={0.3}
      />
      <OnFace shape={body} side='l' at={0.5}>
        <path
          d='M-6.5 -6 H6.5 M-6.5 -14 H6.5 M-6.5 -22 H6.5 M-6.5 -30 H6.5 M-6.5 -38 H6.5 M-6.5 -46 H6.5 M-6.5 -54 H6.5 M-6.5 -62 H6.5'
          className='stroke-tl-glass'
          strokeWidth={3}
          strokeDasharray='2 1.4'
        />
      </OnFace>
      <OnFace shape={body} side='r' at={0.5}>
        <path
          d='M-8 -6 H8 M-8 -14 H8 M-8 -22 H8 M-8 -30 H8 M-8 -38 H8 M-8 -46 H8 M-8 -54 H8 M-8 -62 H8'
          className='stroke-tl-glass'
          strokeWidth={3}
          strokeDasharray='2 1.4'
        />
      </OnFace>
      <Box shape={crown} wall='fill-tl-wall' top='fill-tl-bldg-top' />
    </g>
  );
}

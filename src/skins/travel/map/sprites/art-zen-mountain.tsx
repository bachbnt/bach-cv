/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  RIDGE,
  ridgeAt,
  sides,
} from '@/skins/travel/map/sprites/art-zen-frame';
import { fmt } from '@/skins/travel/map/sprites/art-town-math';

const OUTLINE =
  'M8 148 C16 140 28 130 33 112 C37 98 41 84 45 72 C48 62 50 57 56 53 C63 48 74 46 84 46 C96 46 108 48 114 56 C120 64 122 82 127 98 C132 114 146 128 152 148 Q80 156 8 148z';
const SHADED = `M${RIDGE.map(([y, x]) => `${x} ${y}`).join('L')}L152 148 C146 128 132 114 127 98 C122 82 120 64 114 56 C108 48 100 46 92 46z`;

/** A tuft of canopy: a small arc, in rows across the peak; `shaded` picks the tufts right of the ridge. */
function tufts(shaded: boolean) {
  const out: string[] = [];
  for (let y = 60, row = 0; y < 146; y += 6.5, row++) {
    const { left, right } = sides(y);
    const ridge = ridgeAt(y);
    for (let x = left + 4 + (row % 3) * 2.4; x < right - 4; x += 7.2) {
      const jitter = ((row * 7 + Math.round(x)) % 5) - 2;
      if (x > ridge === shaded) {
        out.push(`M${fmt(x)} ${fmt(y + jitter)}q2 -2.8 4.2 0`);
      }
    }
  }
  return out.join('');
}

/**
 * Chin Khuc, the steep forested peak: a lit left face and a shaded right face either side of a ridge, covered by tufts of canopy,
 * with gullies down the slope and rock at the crest.
 */
export function ForestPeak() {
  return (
    <g>
      <defs>
        <linearGradient id='tl-zen-light' x1='0' y1='0' x2='0' y2='1'>
          <stop
            offset='0'
            style={{ stopColor: 'var(--tl-mtn-t)' }}
            stopOpacity='0.55'
          />
          <stop
            offset='0.55'
            style={{ stopColor: 'var(--tl-mtn-t)' }}
            stopOpacity='0'
          />
        </linearGradient>
      </defs>
      <path d={OUTLINE} className='fill-tl-mtn-s' />
      <path d={SHADED} className='fill-tl-mtn-w' />
      <path d={OUTLINE} fill='url(#tl-zen-light)' />
      <path
        d={tufts(false)}
        className='fill-none stroke-tl-hill-t'
        strokeWidth={1.5}
        strokeLinecap='round'
        opacity={0.85}
      />
      <path
        d={tufts(true)}
        className='fill-none stroke-tl-leaf'
        strokeWidth={1.5}
        strokeLinecap='round'
        opacity={0.7}
      />
      <path
        d='M68 66 q-5 18 2 34 q7 16 -2 40 M50 96 q-2 14 4 24 M110 70 q4 16 -3 30 q-6 14 4 34'
        className='fill-none stroke-tl-mtn-w'
        strokeWidth={1.7}
        strokeLinecap='round'
        opacity={0.55}
      />
      <path
        d={`M${RIDGE.map(([y, x]) => `${x} ${y}`).join('L')}`}
        className='fill-none stroke-tl-mtn-t'
        strokeWidth={1.2}
        strokeLinecap='round'
        strokeLinejoin='round'
        opacity={0.45}
      />
    </g>
  );
}

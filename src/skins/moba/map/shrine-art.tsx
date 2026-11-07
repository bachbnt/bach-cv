/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { refOf } from '@/skins/moba/map/art-ids';

const STAR =
  'M0 -13 L3.8 -4.2 L13 -3.6 L6 2.6 L8.2 11.6 L0 6.8 L-8.2 11.6 L-6 2.6 L-13 -3.6 L-3.8 -4.2Z';

/** The shrine (Certificates): a ring of standing stones around a glowing pad with a relic floating over it. */
export function ShrineArt({ p }: { p: string }) {
  return (
    <g>
      <circle
        r='82'
        fill={refOf(p, 'glow-violet')}
        opacity='0.55'
        className='mb-pulse'
      />
      <ellipse cx='6' cy='18' rx='52' ry='18' fill={refOf(p, 'shade')} />
      <circle
        r='38'
        fill='var(--mb-m-lane-edge)'
        stroke='var(--mb-gold-lo)'
        strokeWidth='2'
      />
      <circle r='30' fill={refOf(p, 'stone')} />
      <circle r='21' fill={refOf(p, 'glow-violet')} />
      <circle
        r='24'
        fill='none'
        stroke='var(--mb-violet)'
        strokeOpacity='0.8'
        strokeWidth='1.6'
        strokeDasharray='5 5'
        className='mb-spin'
      />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        return (
          <g
            key={i}
            transform={`translate(${Math.cos(a) * 48} ${Math.sin(a) * 48}) rotate(${(a * 180) / Math.PI + 90})`}
          >
            <ellipse cx='3' cy='6' rx='7' ry='4' fill={refOf(p, 'shade')} />
            <rect
              x='-5'
              y='-11'
              width='10'
              height='22'
              rx='3'
              fill='var(--mb-m-rock-2)'
              stroke='var(--mb-gold-lo)'
              strokeWidth='1.4'
            />
            <rect
              x='-5'
              y='-11'
              width='4'
              height='22'
              rx='2'
              fill='var(--mb-m-rock-1)'
            />
          </g>
        );
      })}
      <g className='mb-float'>
        <path
          d={STAR}
          fill='var(--mb-gold-hi)'
          stroke='var(--mb-gold)'
          strokeWidth='1.4'
        />
        <path d={STAR} fill='#fff' fillOpacity='0.25' transform='scale(0.55)' />
      </g>
    </g>
  );
}

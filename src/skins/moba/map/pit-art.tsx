/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { refOf } from '@/skins/moba/map/art-ids';

/** An objective pit: a sunken basin ringed by stones. The baron's is violet and swirls, the dragon's is ember and breathes. */
export function PitArt({ p, kind }: { p: string; kind: 'baron' | 'dragon' }) {
  const swirl =
    'M0 0 Q14 -6 18 6 Q20 26 -4 30 Q-36 32 -42 -2 Q-44 -42 -2 -52 Q46 -58 60 -10';
  return (
    <g>
      <circle
        r='132'
        fill={refOf(p, kind === 'baron' ? 'glow-violet' : 'glow-gold')}
        opacity={kind === 'baron' ? 0.45 : 0.4}
        className='mb-pulse'
      />
      <circle r='108' fill='#000' fillOpacity='0.45' />
      <circle
        r='100'
        fill='var(--mb-m-rock-2)'
        stroke='var(--mb-m-wall)'
        strokeWidth='4'
      />
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={Math.cos(a) * 94}
            cy={Math.sin(a) * 94}
            r={i % 2 ? 8 : 10}
            fill='var(--mb-m-rock-1)'
            stroke='var(--mb-m-wall)'
            strokeWidth='1.5'
          />
        );
      })}
      <circle
        r='80'
        fill={refOf(p, kind)}
        stroke='var(--mb-gold-lo)'
        strokeWidth='2'
      />
      {kind === 'baron' ? (
        <g fill='none' strokeLinecap='round'>
          <path
            d={swirl}
            stroke='#e2ccff'
            strokeOpacity='0.7'
            strokeWidth='4'
            className='mb-spin-slow'
          />
          <path
            d={swirl}
            stroke='#2a0f5e'
            strokeOpacity='0.6'
            strokeWidth='9'
            transform='rotate(180)'
            className='mb-spin-slow'
          />
        </g>
      ) : (
        <g
          fill='none'
          stroke='#ffe6a8'
          strokeOpacity='0.85'
          strokeWidth='4'
          strokeLinecap='round'
        >
          <path d='M-30 -32 Q-12 -4 -26 30' />
          <path d='M0 -38 Q18 -4 4 36' />
          <path d='M30 -32 Q48 -4 34 30' />
        </g>
      )}
      <circle
        r='80'
        fill='none'
        stroke='#fff'
        strokeOpacity='0.14'
        strokeWidth='10'
      />
      <circle
        r='14'
        fill={kind === 'baron' ? '#e9d8ff' : '#fff3c9'}
        fillOpacity='0.85'
        className='mb-pulse'
      />
    </g>
  );
}

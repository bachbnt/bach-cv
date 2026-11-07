/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { refOf } from '@/skins/moba/map/art-ids';

/** The shop (Services): a market stall with a striped awning, seen from above, with lamps and a heap of coins. */
export function ShopArt({ p }: { p: string }) {
  return (
    <g>
      <circle
        r='78'
        fill={refOf(p, 'glow-gold')}
        opacity='0.5'
        className='mb-pulse'
      />
      <ellipse cx='8' cy='24' rx='64' ry='22' fill={refOf(p, 'shade')} />
      <rect
        x='-48'
        y='-34'
        width='96'
        height='68'
        rx='7'
        fill='#3a2a16'
        stroke='var(--mb-gold-lo)'
        strokeWidth='2.5'
      />
      <rect x='-44' y='-30' width='88' height='60' rx='5' fill='#5a4222' />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect
            x={-44 + i * 14.67}
            y='-30'
            width='14.67'
            height='38'
            fill={i % 2 ? 'var(--mb-gold-hi)' : 'var(--mb-teal)'}
          />
          <circle
            cx={-44 + i * 14.67 + 7.33}
            cy='8'
            r='7.33'
            fill={i % 2 ? 'var(--mb-gold-hi)' : 'var(--mb-teal)'}
          />
        </g>
      ))}
      <rect
        x='-44'
        y='-30'
        width='88'
        height='38'
        fill='#fff'
        fillOpacity='0.08'
      />
      <g transform='translate(-22 20)'>
        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={i}
            cx={i * 9}
            cy={-i * 1.5}
            rx='7'
            ry='3.5'
            fill='var(--mb-gold)'
            stroke='var(--mb-gold-lo)'
            strokeWidth='1'
          />
        ))}
      </g>
      <rect
        x='20'
        y='14'
        width='14'
        height='11'
        rx='1.5'
        fill='#7a5a2e'
        stroke='var(--mb-gold-lo)'
      />
      <rect
        x='30'
        y='8'
        width='11'
        height='9'
        rx='1.5'
        fill='#8a6836'
        stroke='var(--mb-gold-lo)'
      />
      {[-52, 52].map((x) => (
        <g key={x} transform={`translate(${x} -32)`}>
          <circle r='14' fill={refOf(p, 'glow-gold')} />
          <circle r='3.4' fill='var(--mb-gold-hi)' />
        </g>
      ))}
    </g>
  );
}

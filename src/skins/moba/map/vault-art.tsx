/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { refOf } from '@/skins/moba/map/art-ids';

/** The vault (Payment): a stone platform with a chest, stacks of coins and two braziers. */
export function VaultArt({ p }: { p: string }) {
  return (
    <g>
      <circle
        r='74'
        fill={refOf(p, 'glow-gold')}
        opacity='0.45'
        className='mb-pulse'
      />
      <ellipse cx='7' cy='20' rx='54' ry='18' fill={refOf(p, 'shade')} />
      <circle
        r='46'
        fill='var(--mb-m-lane-edge)'
        stroke='var(--mb-gold-lo)'
        strokeWidth='2.5'
      />
      <circle r='39' fill={refOf(p, 'stone')} />
      <circle
        r='39'
        fill='none'
        stroke='var(--mb-gold)'
        strokeOpacity='0.5'
        strokeDasharray='3 7'
      />
      <rect
        x='-19'
        y='-9'
        width='38'
        height='25'
        rx='3'
        fill='#7a5320'
        stroke='var(--mb-gold-lo)'
        strokeWidth='2'
      />
      <path
        d='M-19 -9 Q0 -27 19 -9Z'
        fill='#9b6e2b'
        stroke='var(--mb-gold-lo)'
        strokeWidth='2'
      />
      <path
        d='M-19 -3 H19 M-19 9 H19'
        stroke='var(--mb-gold)'
        strokeWidth='2'
      />
      <rect
        x='-4'
        y='-4'
        width='8'
        height='10'
        rx='1.5'
        fill='var(--mb-gold-hi)'
        stroke='var(--mb-gold-lo)'
      />
      <g fill='var(--mb-gold)' stroke='var(--mb-gold-lo)' strokeWidth='1'>
        <ellipse cx='28' cy='13' rx='7' ry='3.4' />
        <ellipse cx='28' cy='10' rx='7' ry='3.4' />
        <ellipse cx='28' cy='7' rx='7' ry='3.4' />
        <ellipse cx='-27' cy='14' rx='6' ry='3' />
        <ellipse cx='-27' cy='11' rx='6' ry='3' />
      </g>
      {[-38, 38].map((x) => (
        <g key={x} transform={`translate(${x} -26)`}>
          <circle r='15' fill={refOf(p, 'glow-gold')} />
          <circle r='5.5' fill='#3a2a16' stroke='var(--mb-gold-lo)' />
          <circle r='2.6' fill='var(--mb-orange)' />
        </g>
      ))}
    </g>
  );
}

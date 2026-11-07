/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { refOf } from '@/skins/moba/map/art-ids';
import { NexusArt } from '@/skins/moba/map/nexus-art';
import {
  BLUE_BASE,
  FOUNTAIN_PAD,
  RED_BASE,
  type Pt,
} from '@/skins/moba/world/geometry';
import { hexPath } from '@/skins/moba/world/shapes';

function Plate({
  p,
  at,
  team,
  full,
}: {
  p: string;
  at: Pt;
  team: 'blue' | 'red';
  full: boolean;
}) {
  const color = `var(--mb-team-${team})`;
  return (
    <g transform={`translate(${at.x} ${at.y})`}>
      <circle r='176' fill={refOf(p, `glow-${team}`)} opacity='0.55' />
      <circle r='158' fill='#000' fillOpacity='0.38' />
      <circle
        r='150'
        fill='var(--mb-m-lane-edge)'
        stroke='var(--mb-gold-lo)'
        strokeWidth='3'
      />
      <circle r='141' fill={refOf(p, `plate-${team}`)} />
      {full && <circle r='141' fill={refOf(p, 'hex')} opacity='0.55' />}
      <circle
        r='128'
        fill='none'
        stroke={color}
        strokeOpacity='0.7'
        strokeWidth='2'
        strokeDasharray='2 10'
        strokeLinecap='round'
      />
      <circle
        r='118'
        fill='none'
        stroke='var(--mb-gold)'
        strokeOpacity='0.4'
        strokeWidth='1.5'
      />
      <path
        d={hexPath({ x: 0, y: 0 }, 96, Math.PI / 6)}
        fill='none'
        stroke={color}
        strokeOpacity='0.35'
        strokeWidth='1.5'
      />
      {/* the team banners on the rim */}
      {[0.6, 2.35, 4.1].map((a) => (
        <g
          key={a}
          transform={`translate(${Math.cos(a) * 146} ${Math.sin(a) * 146}) rotate(${(a * 180) / Math.PI + 90})`}
        >
          <rect
            x='-5'
            y='-9'
            width='10'
            height='18'
            rx='2'
            fill={color}
            stroke='var(--mb-gold-lo)'
            strokeWidth='1.5'
          />
        </g>
      ))}
    </g>
  );
}

/** The two bases: a plate with the nexus, and on the blue one the fountain pad where the champion spawns. */
export const BaseArt = memo(function BaseArt({
  p,
  full,
}: {
  p: string;
  full: boolean;
}) {
  return (
    <g>
      <Plate p={p} at={BLUE_BASE} team='blue' full={full} />
      <Plate p={p} at={RED_BASE} team='red' full={full} />
      <g transform={`translate(${FOUNTAIN_PAD.x} ${FOUNTAIN_PAD.y})`}>
        <circle r='46' fill={refOf(p, 'glow-teal')} className='mb-pulse' />
        <circle
          r='30'
          fill='var(--mb-m-lane-edge)'
          stroke='var(--mb-gold)'
          strokeWidth='2.5'
        />
        <circle r='24' fill={refOf(p, 'pool')} />
        <circle
          r='15'
          fill='none'
          stroke='#fff'
          strokeOpacity='0.65'
          strokeWidth='1.4'
          className='mb-ripple'
        />
        <circle
          r='8'
          fill='none'
          stroke='#fff'
          strokeOpacity='0.8'
          strokeWidth='1.2'
          className='mb-ripple mb-ripple-late'
        />
      </g>
      <g transform={`translate(${BLUE_BASE.x} ${BLUE_BASE.y})`}>
        <NexusArt p={p} team='blue' />
      </g>
      <g transform={`translate(${RED_BASE.x} ${RED_BASE.y})`}>
        <NexusArt p={p} team='red' scale={1.12} />
      </g>
    </g>
  );
});

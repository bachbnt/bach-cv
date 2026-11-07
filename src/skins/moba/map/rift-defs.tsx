/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { idOf } from '@/skins/moba/map/art-ids';
import { bladePath, hexPath } from '@/skins/moba/world/shapes';

/** A radial glow: a colour that fades to nothing, used for halos and for the light of crystals and lamps. */
function Glow({
  id,
  color,
  from = 0.75,
}: {
  id: string;
  color: string;
  from?: number;
}) {
  return (
    <radialGradient id={id}>
      <stop offset='0' stopColor={color} stopOpacity={from} />
      <stop offset='0.45' stopColor={color} stopOpacity={from * 0.35} />
      <stop offset='1' stopColor={color} stopOpacity='0' />
    </radialGradient>
  );
}

/** The gradients, patterns and symbols the map is drawn with. `full` adds the textures that the small map does not need. */
export function RiftDefs({ p, full }: { p: string; full: boolean }) {
  const id = (key: string) => idOf(p, key);
  return (
    <defs>
      <radialGradient id={id('floor')} cx='0.5' cy='0.45' r='0.7'>
        <stop offset='0' stopColor='var(--mb-m-floor-1)' />
        <stop offset='0.7' stopColor='var(--mb-m-floor-2)' />
        <stop offset='1' stopColor='var(--mb-m-floor-3)' />
      </radialGradient>
      <linearGradient id={id('lane')} x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0' stopColor='var(--mb-m-lane-1)' />
        <stop offset='1' stopColor='var(--mb-m-lane-2)' />
      </linearGradient>
      <radialGradient id={id('void')} cx='0.5' cy='0.5' r='0.75'>
        <stop offset='0' stopColor='var(--mb-m-wall-hi)' />
        <stop offset='1' stopColor='var(--mb-m-void)' />
      </radialGradient>
      <radialGradient id={id('plate-blue')}>
        <stop offset='0' stopColor='var(--mb-team-blue)' stopOpacity='0.38' />
        <stop offset='0.7' stopColor='var(--mb-m-lane-2)' />
        <stop offset='1' stopColor='var(--mb-m-lane-edge)' />
      </radialGradient>
      <radialGradient id={id('plate-red')}>
        <stop offset='0' stopColor='var(--mb-team-red)' stopOpacity='0.38' />
        <stop offset='0.7' stopColor='var(--mb-m-lane-2)' />
        <stop offset='1' stopColor='var(--mb-m-lane-edge)' />
      </radialGradient>
      <radialGradient id={id('pool')}>
        <stop offset='0' stopColor='var(--mb-m-foam)' stopOpacity='0.95' />
        <stop offset='0.5' stopColor='var(--mb-m-river-1)' />
        <stop offset='1' stopColor='var(--mb-m-river-3)' />
      </radialGradient>
      <radialGradient id={id('baron')}>
        <stop offset='0' stopColor='#b48cff' stopOpacity='0.95' />
        <stop offset='0.5' stopColor='#5a2fa8' />
        <stop offset='1' stopColor='#1c0b3d' />
      </radialGradient>
      <radialGradient id={id('dragon')}>
        <stop offset='0' stopColor='#ffd37a' stopOpacity='0.95' />
        <stop offset='0.5' stopColor='#d2561d' />
        <stop offset='1' stopColor='#3b1208' />
      </radialGradient>
      <radialGradient id={id('stone')} cx='0.4' cy='0.35' r='0.8'>
        <stop offset='0' stopColor='var(--mb-m-rock-1)' />
        <stop offset='1' stopColor='var(--mb-m-rock-2)' />
      </radialGradient>
      <radialGradient id={id('tree')} cx='0.38' cy='0.34' r='0.75'>
        <stop offset='0' stopColor='var(--mb-m-brush-1)' />
        <stop offset='1' stopColor='var(--mb-m-wall)' />
      </radialGradient>
      <radialGradient id={id('shade')}>
        <stop offset='0' stopColor='#000' stopOpacity='0.5' />
        <stop offset='1' stopColor='#000' stopOpacity='0' />
      </radialGradient>
      <Glow id={id('glow-blue')} color='var(--mb-team-blue)' />
      <Glow id={id('glow-red')} color='var(--mb-team-red)' />
      <Glow id={id('glow-teal')} color='var(--mb-teal)' />
      <Glow id={id('glow-gold')} color='var(--mb-gold-hi)' from={0.6} />
      <Glow id={id('glow-violet')} color='var(--mb-violet)' />
      <radialGradient id={id('fog')}>
        <stop offset='0' stopColor='#fff' />
        <stop offset='0.55' stopColor='#fff' stopOpacity='0.9' />
        <stop offset='1' stopColor='#fff' stopOpacity='0' />
      </radialGradient>
      {full && (
        <>
          {/* cobbles for the lanes */}
          <pattern
            id={id('cobble')}
            width='26'
            height='26'
            patternUnits='userSpaceOnUse'
          >
            <rect width='26' height='26' fill='var(--mb-m-lane-2)' />
            <rect
              x='1.5'
              y='1.5'
              width='10.5'
              height='10.5'
              rx='3'
              fill='var(--mb-m-lane-1)'
              opacity='0.8'
            />
            <rect
              x='14'
              y='1.5'
              width='10.5'
              height='10.5'
              rx='3'
              fill='var(--mb-m-lane-1)'
              opacity='0.55'
            />
            <rect
              x='1.5'
              y='14'
              width='10.5'
              height='10.5'
              rx='3'
              fill='var(--mb-m-lane-1)'
              opacity='0.5'
            />
            <rect
              x='14'
              y='14'
              width='10.5'
              height='10.5'
              rx='3'
              fill='var(--mb-m-lane-1)'
              opacity='0.78'
            />
          </pattern>
          {/* tufts of grass over the clearings */}
          <pattern
            id={id('tufts')}
            width='46'
            height='46'
            patternUnits='userSpaceOnUse'
          >
            <path
              d='M6 18 q1 -6 3 -9 M9 18 q0 -7 -1 -11 M12 18 q-1 -5 -4 -8'
              stroke='var(--mb-m-moss)'
              strokeWidth='1.3'
              fill='none'
              opacity='0.55'
              strokeLinecap='round'
            />
            <path
              d='M31 40 q1 -6 3 -9 M34 40 q0 -7 -1 -11 M37 40 q-1 -5 -4 -8'
              stroke='var(--mb-m-moss)'
              strokeWidth='1.3'
              fill='none'
              opacity='0.45'
              strokeLinecap='round'
            />
            <circle
              cx='28'
              cy='13'
              r='1.4'
              fill='var(--mb-m-moss)'
              opacity='0.4'
            />
            <circle
              cx='13'
              cy='33'
              r='1.1'
              fill='var(--mb-m-moss)'
              opacity='0.4'
            />
          </pattern>
          {/* the canopy that fills the walls between the lanes */}
          <pattern
            id={id('canopy')}
            width='84'
            height='84'
            patternUnits='userSpaceOnUse'
          >
            <rect width='84' height='84' fill='var(--mb-m-wall)' />
            {[
              [14, 16, 17],
              [52, 12, 14],
              [72, 46, 18],
              [30, 52, 15],
              [8, 74, 13],
              [58, 78, 12],
            ].map(([x, y, r]) => (
              <g key={`${x}-${y}`}>
                <circle
                  cx={x + 3}
                  cy={y + 4}
                  r={r}
                  fill='#000'
                  opacity='0.25'
                />
                <circle cx={x} cy={y} r={r} fill={`url(#${id('tree')})`} />
                <circle
                  cx={x - r * 0.3}
                  cy={y - r * 0.3}
                  r={r * 0.32}
                  fill='var(--mb-m-moss)'
                  opacity='0.35'
                />
              </g>
            ))}
          </pattern>
          <pattern
            id={id('hex')}
            width='34.64'
            height='60'
            patternUnits='userSpaceOnUse'
            patternTransform='scale(0.9)'
          >
            <path
              d={hexPath({ x: 17.32, y: 20 }, 19)}
              fill='none'
              stroke='var(--mb-m-lane-edge)'
              strokeWidth='1.6'
              opacity='0.8'
            />
            <path
              d={hexPath({ x: 0, y: 50 }, 19)}
              fill='none'
              stroke='var(--mb-m-lane-edge)'
              strokeWidth='1.6'
              opacity='0.8'
            />
            <path
              d={hexPath({ x: 34.64, y: 50 }, 19)}
              fill='none'
              stroke='var(--mb-m-lane-edge)'
              strokeWidth='1.6'
              opacity='0.8'
            />
          </pattern>
          <path id={id('blade-a')} d={bladePath(26, 3.2, 3)} />
          <path id={id('blade-b')} d={bladePath(20, 2.8, -4)} />
        </>
      )}
    </defs>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { PagodaGate } from '@/skins/travel/map/sprites/art-hills-gate';
import { Pine } from '@/skins/travel/map/sprites/art-hills-pine';
import {
  Boulder,
  Box,
  Mound,
  Shadow,
} from '@/skins/travel/map/sprites/art-parts';
import { onTerrace, TERRACE } from '@/skins/travel/map/sprites/art-zen-frame';
import { PrayerFlags } from '@/skins/travel/map/sprites/art-zen-flags';
import { MonasteryHall } from '@/skins/travel/map/sprites/art-zen-hall';
import { ForestPeak } from '@/skins/travel/map/sprites/art-zen-mountain';
import { MountainStair } from '@/skins/travel/map/sprites/art-zen-stair';
import { ThirteenStupa } from '@/skins/travel/map/sprites/art-zen-stupa';

const HALL = onTerrace(3, 13);
const STUPA = onTerrace(17, 3);

/** Truc Lam Phung Thuy Son: the steep forested peak of Chin Khuc with its winding stair, and on the summit the hall, the gate and the golden 13-storey stupa. */
export function ZenPeakArt() {
  return (
    <g>
      <Shadow rx={70} ry={8} cy={149} />
      <ForestPeak />
      <Mound x={34} y={150} w={74} h={26} />
      <Mound x={128} y={150} w={64} h={22} />
      <MountainStair />
      <Pine x={22} y={140} s={1.1} />
      <Pine x={142} y={140} s={1} />
      <Pine x={106} y={104} s={0.9} />
      <Pine x={40} y={100} s={0.8} />
      <Boulder x={38} y={88} rx={9} ry={6} />
      <Boulder x={120} y={112} rx={10} ry={6.5} />
      <Box shape={TERRACE} wall='fill-tl-stone' top='fill-tl-walk' />
      <MonasteryHall x={HALL[0]} y={HALL[1]} />
      <ThirteenStupa x={STUPA[0]} y={STUPA[1]} />
      <g transform='translate(62 76) scale(0.64)'>
        <PagodaGate x={0} y={0} />
      </g>
      <PrayerFlags
        from={[HALL[0] + 2, HALL[1] - 22]}
        to={[STUPA[0] - 3, STUPA[1] - 24]}
      />
      <path
        d='M4 146 q22 -7 46 -3 t44 -1 t40 -2 t22 -1 q-4 9 -24 9 H24 q-16 0 -20 -2z'
        className='fill-tl-foam'
        opacity={0.5}
      />
      <path
        d='M14 134 q16 -4 34 -1 t26 0 q-8 5 -26 4 q-20 2 -34 -3z M104 128 q14 -3 28 0 t18 -1 q-6 5 -20 4 q-14 1 -26 -3z'
        className='fill-tl-foam'
        opacity={0.3}
      />
    </g>
  );
}

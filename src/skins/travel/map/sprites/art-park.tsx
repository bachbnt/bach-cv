/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Castle } from '@/skins/travel/map/sprites/art-park-castle';
import { Coaster } from '@/skins/travel/map/sprites/art-park-coaster';
import { Gondola } from '@/skins/travel/map/sprites/art-park-gondola';
import { HotelTower } from '@/skins/travel/map/sprites/art-park-hotel';
import { Pylon } from '@/skins/travel/map/sprites/art-park-pylon';
import { Station } from '@/skins/travel/map/sprites/art-park-station';
import { FerrisWheel } from '@/skins/travel/map/sprites/art-park-wheel';
import {
  Boulder,
  Mound,
  Palm,
  Shadow,
  Tree,
  WASH_DARK,
} from '@/skins/travel/map/sprites/art-parts';

/** Vinpearl on Hon Tre: a resort island with a hotel tower, a roller coaster, a big Ferris wheel, a fairy-tale castle and palms on a beach. */
export function FerrisIslandArt() {
  return (
    <g>
      <Shadow rx={70} ry={11} />
      <ellipse
        cx={80}
        cy={147}
        rx={74}
        ry={13}
        className='fill-tl-foam'
        opacity={0.5}
      />
      <ellipse cx={80} cy={146} rx={70} ry={12} className='fill-tl-sand-2' />
      <ellipse cx={80} cy={144} rx={65} ry={10.5} className='fill-tl-sand' />
      <Mound x={80} y={143} w={128} h={48} />
      <HotelTower cx={93} y={112} />
      <Coaster x={118} y={58} />
      <FerrisWheel />
      <Castle />
      <Palm x={147} y={146} s={1} lean={-1} />
      <Palm x={13} y={146} s={0.8} />
      <Boulder x={66} y={150} rx={7} ry={4} />
      <ellipse
        cx={104}
        cy={148}
        rx={9}
        ry={1.8}
        className={WASH_DARK}
        opacity={0.15}
      />
    </g>
  );
}

/** The base station of the cable car: a hall with a sloping roof, a platform with a railing and a waiting cabin, and a lattice pylon whose top is where the cable leaves (80, 120). */
export function CableCarArt() {
  return (
    <g>
      <Shadow rx={64} />
      <Mound x={80} y={149} w={140} h={16} />
      <Mound x={124} y={142} w={64} h={34} />
      <Tree x={132} y={128} s={0.75} />
      <Tree x={116} y={134} s={0.65} />
      <Station />
      <path d='M54 122 L80 120' className='stroke-tl-rock' strokeWidth={1.4} />
      <Gondola x={66} y={121} />
      <Pylon x={80} y={148} h={28} />
      <g className='fill-tl-leaf'>
        <ellipse cx={104} cy={147} rx={7} ry={4} />
        <ellipse cx={120} cy={149} rx={9} ry={4.4} />
      </g>
      <g className='fill-tl-stop-3'>
        <circle cx={103} cy={145.6} r={1} />
        <circle cx={107} cy={147} r={1} />
        <circle cx={118} cy={147.6} r={1} />
      </g>
      <Tree x={146} y={147} s={0.8} />
    </g>
  );
}

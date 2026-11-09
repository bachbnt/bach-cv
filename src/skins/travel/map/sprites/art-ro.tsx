/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { FishingBoat } from '@/skins/travel/map/sprites/art-ro-boat';
import { Palm } from '@/skins/travel/map/sprites/art-parts';
import { Jetty } from '@/skins/travel/map/sprites/art-sea-jetty';
import { BarrelYard } from '@/skins/travel/map/sprites/art-ro-barrels';
import { BasketBoat } from '@/skins/travel/map/sprites/art-ro-basket';
import { RoHill } from '@/skins/travel/map/sprites/art-ro-hill';
import { House } from '@/skins/travel/map/sprites/art-ro-house';
import { DryingRack } from '@/skins/travel/map/sprites/art-ro-rack';
import { Shore } from '@/skins/travel/map/sprites/art-ro-shore';

/**
 * Hon Ro: a 344 m green hill on the southern shore of the city with a fishing village at its foot. A forested rounded hill with a
 * rocky crown, a path down to low tin and tile houses, drying racks and nets, a fish-sauce barrel yard, a short jetty, round basket
 * boats and wooden fishing boats on a sand beach.
 */
export function HonRoArt() {
  return (
    <g>
      <Shore />
      <RoHill />
      <House x={98} y={120} roof='fill-tl-rock-2' tin />
      <House x={74} y={128} roof='fill-tl-roof' />
      <House x={50} y={134} roof='fill-tl-rock-2' tin />
      <House x={24} y={130} roof='fill-tl-roof' wl={8} wr={11} h={6} />
      <BarrelYard x={4} y={146} />
      <DryingRack x={42} y={151} />
      <Palm x={134} y={110} s={0.8} lean={-1} />
      <BasketBoat x={70} y={146} />
      <BasketBoat x={88} y={137} s={0.85} />
      <Jetty x={106} y={131} len={26} />
      <FishingBoat x={146} y={142} roof='fill-tl-sun' s={0.8} />
      <Palm x={12} y={126} s={0.9} />
    </g>
  );
}

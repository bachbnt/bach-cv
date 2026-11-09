/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import type { SightArt as ArtKind } from '@/skins/travel/map/sights';
import {
  CathedralArt,
  ChamTowersArt,
  LotusTowerArt,
} from '@/skins/travel/map/sprites/art-landmarks';
import {
  BuddhaPagodaArt,
  TwinRocksArt,
  VillaHillArt,
} from '@/skins/travel/map/sprites/art-hills';
import {
  HotSpringArt,
  WaterfallArt,
} from '@/skins/travel/map/sprites/art-nature';
import {
  FerrisIslandArt,
  CableCarArt,
} from '@/skins/travel/map/sprites/art-park';
import {
  IslandDiveArt,
  IslandMonkeyArt,
} from '@/skins/travel/map/sprites/art-sea';
import { HonMieuArt } from '@/skins/travel/map/sprites/art-sea-mieu';
import { HonMotArt } from '@/skins/travel/map/sprites/art-sea-mot';
import { HonTamArt } from '@/skins/travel/map/sprites/art-sea-tam';
import {
  AquariumArt,
  DomeMarketArt,
  VillaArt,
} from '@/skins/travel/map/sprites/art-town';

/** Every drawing is made in a 160 x 160 box and stands on its bottom centre (80, 150). */
export const ART_BOX = 160;

const DRAWINGS: Partial<Record<ArtKind, () => ReactNode>> = {
  'cham-towers': ChamTowersArt,
  cathedral: CathedralArt,
  'lotus-tower': LotusTowerArt,
  'dome-market': DomeMarketArt,
  villa: VillaArt,
  'hot-spring': HotSpringArt,
  waterfall: WaterfallArt,
  'ferris-island': FerrisIslandArt,
  'cable-car': CableCarArt,
  'hon-mieu': HonMieuArt,
  'hon-tam': HonTamArt,
  'hon-mot': HonMotArt,
  'island-monkey': IslandMonkeyArt,
  'island-dive': IslandDiveArt,
  'twin-rocks': TwinRocksArt,
  'buddha-pagoda': BuddhaPagodaArt,
  'villa-hill': VillaHillArt,
  aquarium: AquariumArt,
};

/** The drawing of a sight (decoration). */
export function SightArt({ art }: { art: ArtKind }) {
  const Drawing = DRAWINGS[art];
  return (
    <svg
      viewBox='0 0 160 160'
      width={ART_BOX}
      height={ART_BOX}
      aria-hidden='true'
      focusable='false'
      data-art={art}
    >
      {Drawing ? (
        <Drawing />
      ) : (
        <rect x='56' y='70' width='48' height='78' className='fill-tl-wall' />
      )}
    </svg>
  );
}

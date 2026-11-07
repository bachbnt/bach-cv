/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { memo } from 'react';
import { BaseArt } from '@/skins/moba/map/base-art';
import { DecorLayer } from '@/skins/moba/map/decor-layer';
import { LoreArt } from '@/skins/moba/map/lore-art';
import { MinionLayer } from '@/skins/moba/map/minion-layer';
import { PitArt } from '@/skins/moba/map/pit-art';
import { PlazaArt } from '@/skins/moba/map/plaza-art';
import { RiftDefs } from '@/skins/moba/map/rift-defs';
import { ShopArt } from '@/skins/moba/map/shop-art';
import { ShrineArt } from '@/skins/moba/map/shrine-art';
import { TerrainLayer } from '@/skins/moba/map/terrain-layer';
import { InhibitorArt, TowerArt } from '@/skins/moba/map/tower-art';
import { VaultArt } from '@/skins/moba/map/vault-art';
import { decorTowers, inhibitors, WORLD } from '@/skins/moba/world/geometry';
import { stationById } from '@/skins/moba/world/stations';

const TOWERS = decorTowers();
const INHIBITORS = inhibitors();

/**
 * The whole map as SVG, without the things the visitor changes (the champion, the towers of the career, the fog): original art in layers of
 * gradients, patterns and soft shadows, no filters and no raster images. `full` is the stage; the minimap draws it without the textures,
 * the decoration and the moving waves.
 */
export const RiftArt = memo(function RiftArt({
  p,
  full,
}: {
  p: string;
  full: boolean;
}) {
  const at = (id: Parameters<typeof stationById>[0]) => {
    const { x, y } = stationById(id).at;
    return `translate(${x} ${y})`;
  };
  return (
    <>
      <RiftDefs p={p} full={full} />
      <TerrainLayer p={p} full={full} />
      {full && <DecorLayer p={p} />}
      <g transform={at('baron')}>
        <PitArt p={p} kind='baron' />
      </g>
      <g transform={at('dragon')}>
        <PitArt p={p} kind='dragon' />
      </g>
      <BaseArt p={p} full={full} />
      <g transform={at('mid')}>
        <PlazaArt p={p} full={full} />
      </g>
      {INHIBITORS.map((i) => (
        <g key={i.id} transform={`translate(${i.at.x} ${i.at.y})`}>
          <InhibitorArt p={p} team={i.team} />
        </g>
      ))}
      {TOWERS.map((t) => (
        <g key={t.id} transform={`translate(${t.at.x} ${t.at.y})`}>
          <TowerArt p={p} team={t.team} scale={t.kind === 'nexus' ? 0.9 : 1} />
        </g>
      ))}
      <g transform={at('shop')}>
        <ShopArt p={p} />
      </g>
      <g transform={at('vault')}>
        <VaultArt p={p} />
      </g>
      <g transform={at('shrine')}>
        <ShrineArt p={p} />
      </g>
      <g transform={at('lore')}>
        <LoreArt p={p} />
      </g>
      {full && <MinionLayer />}
    </>
  );
});

export const RIFT_VIEWBOX = `0 0 ${WORLD} ${WORLD}`;

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { Category } from '@/skins/trade/blocks/data-skill-heat-model';
import { cn } from '@/lib/utils';
import {
  groupHeight,
  layoutGroup,
  type HeatGroup,
  type HeatTile,
} from '@/skins/trade/blocks/data-skill-heat-model';
import { Tile } from '@/skins/trade/blocks/data-skill-heat-tile';

export const DOT: Record<Category, string> = {
  ai: 'bg-tv-violet',
  mobile: 'bg-tv-up',
  web: 'bg-tv-sky',
  tools: 'bg-tv-gold',
};

export function HeatMap({
  group,
  width,
  scale,
  title,
  pinned,
  tabbable,
  tipId,
  usedText,
  labelOf,
  onTip,
  onHide,
  onFocusTile,
  onPin,
}: {
  group: HeatGroup;
  /** the width of the maps and the area of a month, the same for all of them */
  width: number;
  scale: number;
  title: string;
  pinned: string | null;
  tabbable: string | undefined;
  tipId: string | undefined;
  usedText: (tile: HeatTile) => string;
  labelOf: (tile: HeatTile) => string;
  onTip: (tile: HeatTile, element: HTMLElement) => void;
  onHide: () => void;
  onFocusTile: (id: string) => void;
  onPin: (id: string) => void;
}) {
  const height = groupHeight(group, width, scale);
  const rects = new Map(layoutGroup(group, width, scale).map((r) => [r.id, r]));
  return (
    <section aria-label={title}>
      <h4 className='mb-1.5 flex items-center gap-2 text-[13px] font-semibold'>
        <span
          aria-hidden='true'
          className={cn('size-2 rounded-sm', DOT[group.category])}
        />
        {title}
        <span className='text-xs font-normal text-tv-mute tabular-nums'>
          {group.tiles.length}
        </span>
      </h4>
      <div data-heat-map='' className='relative w-full' style={{ height }}>
        {group.tiles.map((tile, index) => {
          const rect = rects.get(tile.skill.id);
          if (!rect) return null;
          return (
            <Tile
              key={tile.skill.id}
              tile={tile}
              area={group.category}
              rect={rect}
              box={{ width, height }}
              index={index}
              pinned={pinned === tile.skill.id}
              tabbable={tabbable === tile.skill.id}
              active={tipId === tile.skill.id}
              used={usedText(tile)}
              label={labelOf(tile)}
              onTip={onTip}
              onHide={onHide}
              onFocusTile={onFocusTile}
              onPin={onPin}
            />
          );
        })}
      </div>
    </section>
  );
}

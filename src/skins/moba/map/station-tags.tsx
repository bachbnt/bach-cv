/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { memo } from 'react';
import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import { useCopy } from '@/lib/i18n/copy';
import { PLACE } from '@/skins/moba/config';
import { pageName } from '@/skins/moba/map/page-name';
import { useGame } from '@/skins/moba/shell/game-context';
import { stationOfPage, STATIONS } from '@/skins/moba/world/stations';
import { cn } from '@/lib/utils';

/** How far above its centre a landmark's tag floats, in map units. */
const LIFT: Record<string, number> = {
  fountain: 40,
  shop: 58,
  vault: 62,
  mid: 82,
  dragon: 110,
  baron: 110,
  shrine: 64,
  lore: 66,
};

/**
 * The name tags over the landmarks of the map: pointer shortcuts to walk to a place. The list of places is the real control (with keys
 * and links), so these are hidden from assistive technology and out of the tab order.
 */
export const StationTags = memo(function StationTags() {
  const common = useCopy(commonCopy);
  const copy = useCopy(mobaCopy);
  const { scale, current, walkingTo, standingAt, walkToStation } = useGame();
  const here = stationOfPage(current).id;
  return (
    <>
      {STATIONS.map((station) => {
        const Icon = PLACE[station.page].icon;
        const place =
          station.id === 'baron' ? copy.pits.baron : copy.places[station.page];
        return (
          <div
            key={station.id}
            className={cn(
              'absolute z-10 -translate-x-1/2 -translate-y-full transition-opacity duration-200',
              // the champion's own name plate stands there, so the tag steps aside
              standingAt === station.id && 'pointer-events-none opacity-0',
            )}
            style={{
              left: station.at.x * scale,
              top: (station.at.y - LIFT[station.id]) * scale,
            }}
          >
            <button
              type='button'
              tabIndex={-1}
              aria-hidden='true'
              data-station={station.id}
              data-here={station.id === here || undefined}
              data-walking={walkingTo?.id === station.id || undefined}
              onClick={(event) => {
                event.stopPropagation();
                walkToStation(station.id);
              }}
              className={cn(
                'mb-tag group flex min-h-9 cursor-pointer items-center gap-2 px-2.5 py-1 text-left pointer-coarse:min-h-11',
              )}
            >
              <Icon
                aria-hidden='true'
                className='size-4 flex-none text-mb-gold-ink'
              />
              <span className='flex flex-col leading-none'>
                <span className='font-mb-display text-[15px] font-bold tracking-wide whitespace-nowrap text-mb-ink'>
                  {pageName(station.page, common, copy)}
                </span>
                <span className='mt-0.5 text-[10px] font-semibold tracking-[0.14em] whitespace-nowrap text-mb-mute uppercase'>
                  {place}
                </span>
              </span>
            </button>
          </div>
        );
      })}
    </>
  );
});

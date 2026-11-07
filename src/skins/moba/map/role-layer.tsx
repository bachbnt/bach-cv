/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check, Flag } from 'lucide-react';
import { mobaCopy } from '@/content/copy/moba';
import { fill } from '@/lib/chat/fill';
import { jobBadge } from '@/lib/derive/job-badge';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TowerArt } from '@/skins/moba/map/tower-art';
import { useGame } from '@/skins/moba/shell/game-context';
import { WORLD } from '@/skins/moba/world/geometry';

/**
 * The career on the map: the roles in the order they happened are towers along the red half of the mid lane (a tower the champion has
 * walked past is taken and turns blue), and the current role is the red nexus. Each tower has a tag with the company; the tag is a
 * pointer shortcut (the Resume page is the real, accessible list).
 */
export function RoleLayer({ p }: { p: string }) {
  const copy = useCopy(mobaCopy).map;
  const { scale, stops, captured, walkToStop } = useGame();
  return (
    <>
      <svg
        viewBox={`0 0 ${WORLD} ${WORLD}`}
        className='pointer-events-none absolute inset-0 size-full'
        aria-hidden='true'
        focusable='false'
      >
        {stops
          .filter((stop) => !stop.nexus)
          .map((stop) => (
            <g
              key={stop.job.id}
              transform={`translate(${stop.at.x} ${stop.at.y})`}
            >
              <TowerArt
                p={p}
                team={captured.has(stop.job.id) ? 'blue' : 'red'}
                scale={1.22}
              />
            </g>
          ))}
      </svg>
      {stops.map((stop) => {
        const taken = captured.has(stop.job.id);
        return (
          <div
            key={stop.job.id}
            className='absolute z-10 -translate-x-1/2 -translate-y-full'
            style={{
              left: stop.at.x * scale,
              top: (stop.at.y - (stop.nexus ? 74 : 42)) * scale,
            }}
          >
            <button
              type='button'
              tabIndex={-1}
              aria-hidden='true'
              data-role={stop.job.id}
              data-taken={taken || undefined}
              data-nexus={stop.nexus || undefined}
              onClick={(event) => {
                event.stopPropagation();
                walkToStop(stop);
              }}
              className={cn(
                'mb-tag mb-tag-role flex min-h-8 cursor-pointer items-center gap-1.5 px-2 py-0.5 pointer-coarse:min-h-11',
              )}
              title={fill(copy.push, { n: stop.n, total: stop.total })}
            >
              {stop.nexus ? (
                <Flag
                  aria-hidden='true'
                  className='size-3.5 flex-none text-mb-red-ink'
                />
              ) : taken ? (
                <Check
                  aria-hidden='true'
                  className='size-3.5 flex-none text-mb-teal-ink'
                />
              ) : (
                <span className='grid size-4 flex-none place-items-center bg-mb-red/80 text-[10px] leading-none font-bold text-white'>
                  {stop.n}
                </span>
              )}
              <span className='font-mb-display text-[14px] leading-none font-bold tracking-wide whitespace-nowrap text-mb-ink'>
                {jobBadge(stop.job)}
              </span>
            </button>
          </div>
        );
      })}
    </>
  );
}

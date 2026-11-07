/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { BookOpen, Briefcase } from 'lucide-react';
import type { CSSProperties } from 'react';
import { toWorld } from '@/skins/travel/map/iso';
import type { MapStop } from '@/skins/travel/map/types';
import { cn } from '@/lib/utils';

/**
 * The pins of the stops: real buttons (Tab and Enter work without the pointer), so the map is never the only way to a stop. The one that
 * is open stands out; the current job has the "You are here" flag.
 */
export function Pins({
  stops,
  activeId,
  youAreHere,
  onSelect,
}: {
  stops: readonly MapStop[];
  activeId: string | null;
  youAreHere: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {[...stops]
        .sort((a, b) => a.placed.at.y - b.placed.at.y)
        .map((stop) => {
          const w = toWorld(stop.placed.at);
          const left = stop.placed.at.x < stop.placed.from.x - 1;
          return (
            <div
              key={stop.id}
              className={cn(
                'tl-sprite tl-pin',
                activeId === stop.id && 'tl-pin-on',
                left && 'tl-pin-left',
              )}
              style={
                {
                  left: w.x,
                  top: w.y,
                  zIndex: Math.round(w.y) + 2000,
                  '--tl-pc': `var(--tl-stop-${stop.color})`,
                } as CSSProperties
              }
            >
              {stop.current && (
                <span aria-hidden='true' className='tl-pin-flag'>
                  <i className='tl-live' />
                  {youAreHere}
                </span>
              )}
              <button
                type='button'
                aria-label={stop.name}
                aria-current={activeId === stop.id ? 'true' : undefined}
                onClick={() => onSelect(stop.id)}
                className='tl-pin-btn'
              >
                <span aria-hidden='true' className='tl-pin-head'>
                  {stop.type === 'school' ? <BookOpen /> : <Briefcase />}
                </span>
                <span aria-hidden='true' className='tl-pin-label'>
                  <b>{stop.title}</b>
                  <small>{stop.period}</small>
                </span>
              </button>
            </div>
          );
        })}
    </>
  );
}

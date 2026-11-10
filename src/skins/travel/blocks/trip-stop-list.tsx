/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { BookOpen, Briefcase } from 'lucide-react';
import type { CSSProperties } from 'react';
import { resumeCopy } from '@/content/copy/resume';
import { travelTripCopy } from '@/content/copy/travel-trip';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { useTravel, type TripStop } from '@/skins/travel/shell/travel-context';
import { TripCurrentFlag } from '@/skins/travel/blocks/trip-current-flag';

/**
 * The itinerary: every stop of the trip as a button in order (a dotted road down the left, side trips indented). Picking one opens its
 * card and sends the map there; the open one is `aria-current`. With `only`, just those stops, in the order given (Home's latest roles).
 */
export function TripStopList({
  selectedId,
  onPick,
  showTagline = false,
  only,
}: {
  selectedId: string | null;
  onPick: (id: string) => void;
  showTagline?: boolean;
  only?: TripStop[];
}) {
  const travel = useTravel();
  const stops = only ?? travel.stops;
  const words = useCopy(travelTripCopy).resume;
  const current = useCopy(resumeCopy).experience.current;
  return (
    <ol
      aria-label={words.stopsLabel}
      className='tl-road-draw relative m-0 list-none p-0 before:absolute before:top-5 before:bottom-5 before:left-[21px] before:border-l-[3px] before:border-dotted before:border-tl-coral before:opacity-60 before:content-[""]'
    >
      {stops.map(({ career, map }, i) => (
        <li
          key={map.id}
          className='tl-stop-in'
          style={{ '--dl': `${200 + Math.min(i, 8) * 110}ms` } as CSSProperties}
        >
          <button
            type='button'
            aria-current={selectedId === map.id ? 'true' : undefined}
            onClick={() => onPick(map.id)}
            style={
              { '--tl-pc': `var(--tl-stop-${map.color})` } as CSSProperties
            }
            className={cn(
              'relative flex w-full cursor-pointer items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors pointer-coarse:min-h-12 hover:bg-tl-chip aria-[current=true]:bg-[color-mix(in_srgb,var(--tl-pc)_16%,transparent)]',
              career.side &&
                'ml-[22px] w-[calc(100%-22px)] before:absolute before:top-1/2 before:-left-3 before:w-3.5 before:border-t-[3px] before:border-dotted before:border-[var(--tl-pc)] before:content-[""]',
            )}
          >
            <span
              aria-hidden='true'
              className={cn(
                'tl-node-in z-[1] grid flex-none place-items-center rounded-full border-[3px] border-tl-solid bg-[var(--tl-pc)] text-white shadow-[0_0_0_2px_var(--tl-pc)]',
                career.side ? 'size-[22px]' : 'size-7',
              )}
            >
              {career.type === 'school' ? (
                <BookOpen className='size-3.5' />
              ) : (
                <Briefcase className='size-3.5' />
              )}
            </span>
            <span className='min-w-0 flex-1'>
              <b className='block text-[13.5px]/[1.2]'>{map.title}</b>
              <small className='block text-[11.5px] text-tl-muted'>
                {career.type === 'job' ? `${career.job.role} · ` : ''}
                {map.period}
              </small>
              {showTagline && career.type === 'job' && career.job.tagline && (
                <small className='mt-0.5 block text-[12px] text-tl-muted'>
                  {career.job.tagline}
                </small>
              )}
            </span>
            {career.current && <TripCurrentFlag>{current}</TripCurrentFlag>}
            {career.side && <span className='sr-only'>{words.sideTrip}</span>}
          </button>
        </li>
      ))}
    </ol>
  );
}

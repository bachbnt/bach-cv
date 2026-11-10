/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Play, Square } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import { homeCopy } from '@/content/copy/home';
import { travelTripCopy } from '@/content/copy/travel-trip';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useCareerYears, useYearsText } from '@/lib/query/use-career-years';
import { useTravel } from '@/skins/travel/shell/travel-context';
import { TlButton } from '@/skins/travel/ui/tl-button';
import { TlKicker } from '@/skins/travel/ui/tl-kicker';

export const HOME_TITLE_ID = 'tl-home-title';

/** The turn of a part of the card as it arrives: the lines rise one after another, the facts and the button pop in after them. */
const turn = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });
const pop = (ms: number) => ({ '--dl': `${ms}ms` }) as CSSProperties;

/** The first card of the trip: who travels (the owner's photo), the Standard title and intro, two facts and the button that starts the tour of the stops. */
export function HomeHero() {
  const copy = useCopy(homeCopy);
  const words = useCopy(travelTripCopy).home;
  const { lang } = useLang();
  const { stops, touring, startTour, stopTour, selectedId } = useTravel();
  const years = useCareerYears();
  const intro = useYearsText(copy.intro, copy.introUndated);
  const riding = touring
    ? stops.find((s) => s.map.id === selectedId)?.map.title
    : undefined;
  return (
    <header className='flex flex-col gap-3'>
      <div className='flex items-center gap-3.5'>
        {shell.avatar && (
          <span className='tl-portrait-in relative size-16 flex-none overflow-hidden rounded-full border-[3px] border-tl-solid shadow-tl-avatar'>
            <Image
              src={shell.avatar}
              alt={fill(copy.avatarAlt, { name: shell.name })}
              fill
              sizes='64px'
              priority
              className='object-cover object-[50%_35%]'
            />
          </span>
        )}
        <div className='tl-rise min-w-0' style={turn(120)}>
          <TlKicker>{localize(shell, lang).headline}</TlKicker>
          <p className='m-0 text-[28px]/[1.05] font-extrabold tracking-[-0.5px]'>
            {shell.name}
          </p>
        </div>
      </div>
      <h1
        id={HOME_TITLE_ID}
        className='tl-rise m-0 text-[19px]/[1.25] font-extrabold'
        style={turn(220)}
      >
        {copy.title}
      </h1>
      <p className='tl-rise m-0 text-tl-muted' style={turn(300)}>
        {intro}
      </p>
      <ul className='m-0 flex list-none flex-wrap gap-2 p-0'>
        {years !== null && (
          <li
            className='tl-chip-in min-w-[110px] flex-1 rounded-2xl bg-tl-chip px-3 py-2 text-tl-chip-ink'
            style={pop(420)}
          >
            <b className='block text-[22px]/[1.1]'>{years}</b>
            <span className='text-xs font-semibold'>{words.yearsLabel}</span>
          </li>
        )}
        {stops.length > 0 && (
          <li
            className='tl-chip-in min-w-[110px] flex-1 rounded-2xl bg-tl-chip px-3 py-2 text-tl-chip-ink'
            style={pop(500)}
          >
            <b className='block text-[22px]/[1.1]'>{stops.length}</b>
            <span className='text-xs font-semibold'>{words.stopsLabel}</span>
          </li>
        )}
      </ul>
      {stops.length > 0 && (
        <div className='flex items-center gap-3'>
          <TlButton
            variant='solid'
            aria-pressed={touring}
            onClick={touring ? stopTour : startTour}
            className='tl-chip-in flex-none'
            style={pop(620)}
          >
            {touring ? (
              <Square aria-hidden='true' />
            ) : (
              <Play aria-hidden='true' />
            )}
            {touring ? words.stopTrip : words.startTrip}
          </TlButton>
          {/* the sentence is for the screen reader; what is seen is a badge on the same row as the button, so the row never changes height */}
          <p role='status' className='m-0 min-w-0'>
            {riding && (
              <>
                <span className='sr-only'>
                  {fill(words.tripRunning, { name: riding })}
                </span>
                <span
                  aria-hidden='true'
                  className='tl-rise flex max-w-full min-w-0 items-center gap-2 rounded-full bg-tl-chip py-1.5 pr-3.5 pl-3 text-tl-chip-ink'
                >
                  <span className='tl-live relative size-2 flex-none rounded-full bg-tl-teal' />
                  <span className='flex min-w-0 flex-col leading-tight'>
                    <small className='text-[10.5px] font-extrabold tracking-[0.8px] text-tl-coral uppercase'>
                      {words.ridingTo}
                    </small>
                    <b className='truncate text-[13.5px] font-extrabold'>
                      {riding}
                    </b>
                  </span>
                </span>
              </>
            )}
          </p>
        </div>
      )}
    </header>
  );
}

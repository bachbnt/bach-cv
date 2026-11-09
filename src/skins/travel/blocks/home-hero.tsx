/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Play, Square } from 'lucide-react';
import Image from 'next/image';
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
          <span className='relative size-16 flex-none overflow-hidden rounded-full border-[3px] border-tl-solid shadow-tl-avatar'>
            <Image
              src={shell.avatar}
              alt={`${shell.name} reading a book`}
              fill
              sizes='64px'
              priority
              className='object-cover object-[50%_35%]'
            />
          </span>
        )}
        <div className='min-w-0'>
          <TlKicker>{localize(shell, lang).headline}</TlKicker>
          <p className='m-0 text-[28px]/[1.05] font-extrabold tracking-[-0.5px]'>
            {shell.name}
          </p>
        </div>
      </div>
      <h1 id={HOME_TITLE_ID} className='m-0 text-[19px]/[1.25] font-extrabold'>
        {copy.title}
      </h1>
      <p className='m-0 text-tl-muted'>{intro}</p>
      <ul className='m-0 flex list-none flex-wrap gap-2 p-0'>
        {years !== null && (
          <li className='min-w-[110px] flex-1 rounded-2xl bg-tl-chip px-3 py-2 text-tl-chip-ink'>
            <b className='block text-[22px]/[1.1]'>{years}</b>
            <span className='text-xs font-semibold'>{words.yearsLabel}</span>
          </li>
        )}
        {stops.length > 0 && (
          <li className='min-w-[110px] flex-1 rounded-2xl bg-tl-chip px-3 py-2 text-tl-chip-ink'>
            <b className='block text-[22px]/[1.1]'>{stops.length}</b>
            <span className='text-xs font-semibold'>{words.stopsLabel}</span>
          </li>
        )}
      </ul>
      {stops.length > 0 && (
        <div className='flex flex-wrap items-center gap-2'>
          <TlButton
            variant='solid'
            aria-pressed={touring}
            onClick={touring ? stopTour : startTour}
          >
            {touring ? (
              <Square aria-hidden='true' />
            ) : (
              <Play aria-hidden='true' />
            )}
            {touring ? words.stopTrip : words.startTrip}
          </TlButton>
          <p
            role='status'
            className='m-0 text-[12.5px] font-semibold text-tl-muted'
          >
            {riding ? fill(words.tripRunning, { name: riding }) : ''}
          </p>
        </div>
      )}
    </header>
  );
}

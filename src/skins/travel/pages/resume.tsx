/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { travelTripCopy } from '@/content/copy/travel-trip';
import { useCopy } from '@/lib/i18n/copy';
import { useYearsText } from '@/lib/query/use-career-years';
import { TripLuggage } from '@/skins/travel/blocks/trip-luggage';
import { TripStopCard } from '@/skins/travel/blocks/trip-stop-card';
import { TripStopList } from '@/skins/travel/blocks/trip-stop-list';
import { useTravel } from '@/skins/travel/shell/travel-context';
import { TlDataState } from '@/skins/travel/ui/tl-data-state';
import { TlPage } from '@/skins/travel/ui/tl-page';
import { TlPanel } from '@/skins/travel/ui/tl-panel';
import { TlRowsSkeleton } from '@/skins/travel/ui/tl-skeleton';

/**
 * The route: every role and the school is a stop of the itinerary, the open one is a guidebook card (its responsibilities are things
 * to see, its technologies the souvenirs), and the skills are the packing list. Same data and words as the Standard Resume page.
 */
export function ResumePage() {
  const copy = useCopy(resumeCopy);
  const words = useCopy(travelTripCopy).resume;
  const intro = useYearsText(copy.intro, copy.introUndated, { spelled: true });
  const { stops, selectedId, select, queries } = useTravel();
  const { experience, education } = queries;
  const currentId =
    stops.find((s) => s.career.current)?.map.id ?? stops.at(-1)?.map.id ?? null;
  const openId = selectedId ?? currentId;
  const index = stops.findIndex((s) => s.map.id === openId);
  const open = index >= 0 ? stops[index] : undefined;

  return (
    <TlPage page='resume'>
      <TlPanel side='right' labelledBy='tl-resume-title'>
        <div className='grid grid-cols-1 gap-5 p-4 pt-2 md:p-5'>
          <header>
            <h1 id='tl-resume-title' className='m-0 text-2xl font-extrabold'>
              {copy.title}
            </h1>
            <p className='m-0 mt-1 text-tl-muted'>{intro}</p>
          </header>
          <TlDataState
            query={{
              isPending: experience.isPending || education.isPending,
              isError: experience.isError || education.isError,
              refetch: () =>
                Promise.all([experience.refetch(), education.refetch()]),
            }}
            count={experience.data?.length ?? 0}
            empty='experience'
            subject='experience'
            skeleton={<TlRowsSkeleton count={4} />}
          >
            {null}
          </TlDataState>
          {stops.length > 0 && (
            <>
              <section aria-labelledby='tl-itinerary'>
                <h2
                  id='tl-itinerary'
                  className='m-0 text-[17px] font-extrabold'
                >
                  {copy.experience.title} · {words.itinerary}
                </h2>
                <p className='m-0 mb-2 text-[12.5px] text-tl-muted'>
                  {words.pickStop}
                </p>
                <TripStopList selectedId={openId} onPick={select} />
              </section>
              {open && (
                <TripStopCard
                  key={open.map.id}
                  stop={open}
                  index={index}
                  total={stops.length}
                  onStep={(by) => select(stops[index + by]?.map.id ?? null)}
                />
              )}
            </>
          )}
          <section
            id='skills'
            aria-labelledby='tl-skills'
            className='scroll-mt-4'
          >
            <h2 id='tl-skills' className='m-0 text-[17px] font-extrabold'>
              {copy.skills.title}
            </h2>
            <p className='m-0 mb-3 text-[12.5px] text-tl-muted'>
              {copy.skills.lead}
            </p>
            <TripLuggage />
          </section>
        </div>
      </TlPanel>
    </TlPage>
  );
}

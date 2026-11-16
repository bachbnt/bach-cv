/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { useScrollToHash } from '@/hooks/use-scroll-to-hash';
import { useCopy } from '@/lib/i18n/copy';
import { YearsText } from '@/components/years-text';
import { TripItineraryHead } from '@/skins/travel/blocks/trip-itinerary-head';
import { TripLuggage } from '@/skins/travel/blocks/trip-luggage';
import { TripSkeleton } from '@/skins/travel/blocks/trip-skeleton';
import { TripStopCard } from '@/skins/travel/blocks/trip-stop-card';
import { TripStopList } from '@/skins/travel/blocks/trip-stop-list';
import { useTravel } from '@/skins/travel/shell/travel-context';
import { TlDataState } from '@/skins/travel/ui/tl-data-state';
import { TlPage } from '@/skins/travel/ui/tl-page';
import { TlPanel } from '@/skins/travel/ui/tl-panel';

/**
 * The route: every role and the school is a stop of the itinerary, the open one is a guidebook card (its responsibilities are things
 * to see, its technologies the souvenirs), and the skills are the packing list. Same data and words as the Standard Resume page.
 */
export function ResumePage() {
  const copy = useCopy(resumeCopy);
  const { stops, selectedId, select, queries } = useTravel();
  const { experience, education } = queries;
  const currentId =
    stops.find((s) => s.career.current)?.map.id ?? stops.at(-1)?.map.id ?? null;
  const openId = selectedId ?? currentId;
  const index = stops.findIndex((s) => s.map.id === openId);
  const { isPending: skillsPending } = useSkills();
  // the link "See all skills" of About ends in #skills, below the itinerary and the open stop
  useScrollToHash(
    !experience.isPending && !education.isPending && !skillsPending,
  );
  const open = index >= 0 ? stops[index] : undefined;

  return (
    <TlPage page='resume'>
      <TlPanel side='right' labelledBy='tl-resume-title'>
        <div className='grid grid-cols-1 gap-5 p-4 pt-2 md:p-5'>
          <header>
            <h1 id='tl-resume-title' className='m-0 text-2xl font-extrabold'>
              {copy.title}
            </h1>
            <p className='m-0 mt-1 text-tl-muted'>
              <YearsText
                withYears={copy.intro}
                withoutYears={copy.introUndated}
                spelled
              />
            </p>
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
            skeleton={<TripSkeleton />}
            skeletonClassName='grid grid-cols-1 gap-5'
          >
            {null}
          </TlDataState>
          {stops.length > 0 && (
            <>
              <section aria-labelledby='tl-itinerary'>
                <TripItineraryHead />
                <TripStopList selectedId={openId} onPick={select} />
              </section>
              {open && (
                <TripStopCard
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

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { travelTripCopy } from '@/content/copy/travel-trip';
import { useCopy } from '@/lib/i18n/copy';

/** The title and the hint of the itinerary on Resume (the same words while the roles load). */
export function TripItineraryHead() {
  const copy = useCopy(resumeCopy);
  const words = useCopy(travelTripCopy).resume;
  return (
    <>
      <h2 id='tl-itinerary' className='m-0 text-[17px] font-extrabold'>
        {copy.experience.title} · {words.itinerary}
      </h2>
      <p className='m-0 mb-2 text-[12.5px] text-tl-muted'>{words.pickStop}</p>
    </>
  );
}

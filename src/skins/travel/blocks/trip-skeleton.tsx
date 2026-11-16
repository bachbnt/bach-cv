/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { TripGuideSkeleton } from '@/skins/travel/blocks/trip-guide-skeleton';
import { TripItineraryHead } from '@/skins/travel/blocks/trip-itinerary-head';
import { TripStopListSkeleton } from '@/skins/travel/blocks/trip-stop-list-skeleton';

/** What each stop of the itinerary measures once loaded (the first one is taller: it has the Current flag). */
const STOP_HEIGHTS = [
  'h-[68px]',
  'h-[52px]',
  'h-[52px]',
  'h-[52px]',
  'h-[52px]',
] as const;

/** The itinerary of Resume and the open stop, laid out as the loaded page does; the title and the hint are real. */
export function TripSkeleton() {
  return (
    <>
      <section>
        <TripItineraryHead />
        <TripStopListSkeleton heights={STOP_HEIGHTS} />
      </section>
      <TripGuideSkeleton />
    </>
  );
}

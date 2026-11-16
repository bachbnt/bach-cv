/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { HOME_ROLES } from '@/lib/derive/home-lists';
import { TripStopListSkeleton } from '@/skins/travel/blocks/trip-stop-list-skeleton';

/** What each of the latest stops measures once loaded (with its tagline): the newest two are taller, and on the narrowest phone (under 360px) every one has a line more. */
const STOP_HEIGHTS = [
  'h-[121px] max-[359px]:h-[154px]',
  'h-[105px] max-[359px]:h-[138px]',
  'h-[88px] max-[359px]:h-[121px]',
  'h-[88px] max-[359px]:h-[121px]',
];

/** The latest roles of Home as the stops of the loaded list. */
export function HomeWorkSkeleton() {
  return <TripStopListSkeleton heights={STOP_HEIGHTS.slice(0, HOME_ROLES)} />;
}

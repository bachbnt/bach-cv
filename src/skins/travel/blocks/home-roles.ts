/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { latestRoles } from '@/lib/derive/home-lists';
import type { TripStop } from '@/skins/travel/shell/travel-context';

/**
 * The stops Home lists under "Where I've worked": the stops of the latest roles of Standard's list (`latestRoles`, newest first, at most
 * `HOME_ROLES`). The school, and the jobs Standard's Home leaves out, are not listed; they stay on the map and on the Resume page.
 */
export function latestStops(
  jobs: { id: string }[],
  stops: TripStop[],
): TripStop[] {
  return latestRoles(jobs).flatMap((job) => {
    const stop = stops.find(
      (s) => s.career.type === 'job' && s.career.id === job.id,
    );
    return stop ? [stop] : [];
  });
}

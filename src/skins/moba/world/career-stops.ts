/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { latestJob } from '@/lib/derive/current-job';
import type { MonthSpanned } from '@/lib/derive/career-months';
import { oldestFirst } from '@/lib/derive/oldest-first';
import { RED_BASE, roleTowerSpots, type Pt } from '@/skins/moba/world/geometry';

export interface CareerStop<T> {
  job: T;
  at: Pt;
  /** the position in the career, from 1 */
  n: number;
  total: number;
  /** the last stop is the nexus: the role the visitor is pushing toward */
  nexus: boolean;
}

/**
 * The career as places of the map: the roles in the order they happened are towers along the red half of the mid lane, and the role
 * that counts as "now" (the current one) is the red nexus.
 */
export function careerStops<T extends MonthSpanned>(
  jobs: T[],
): CareerStop<T>[] {
  const now = latestJob(jobs);
  if (!now) return [];
  const before = oldestFirst(jobs.filter((job) => job !== now));
  const spots = roleTowerSpots(before.length);
  const total = jobs.length;
  return [
    ...before.map((job, i) => ({
      job,
      at: spots[i],
      n: i + 1,
      total,
      nexus: false,
    })),
    { job: now, at: RED_BASE, n: total, total, nexus: true },
  ];
}

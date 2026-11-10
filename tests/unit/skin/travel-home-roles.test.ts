/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { HOME_ROLES, latestRoles } from '@/lib/derive/home-lists';
import { latestStops } from '@/skins/travel/blocks/home-roles';
import type { TripStop } from '@/skins/travel/shell/travel-context';

const job = (id: string) => ({ id });
// only what `latestStops` reads of a stop
const stop = (id: string, type: 'job' | 'school' = 'job') =>
  ({ career: { id, type } }) as unknown as TripStop;

describe('the stops Home lists', () => {
  // the trip order is oldest first (the school, then the jobs); Standard's list is newest first
  const stops = [
    stop('school-a', 'school'),
    ...['j1', 'j2', 'j3', 'j4', 'j5', 'j6'].map((id) => stop(id)),
  ];
  const jobs = ['j6', 'j5', 'j4', 'j3', 'j2', 'j1'].map(job);

  it('are the stops of the roles Standard lists, in Standard order, and no more than HOME_ROLES', () => {
    const shown = latestStops(jobs, stops).map((s) => s.career.id);
    expect(shown).toEqual(latestRoles(jobs).map((j) => j.id));
    expect(shown).toHaveLength(HOME_ROLES);
    expect(shown).toEqual(['j6', 'j5', 'j4', 'j3']);
  });

  it('leave out the school and every role Standard leaves out', () => {
    const shown = latestStops(jobs, stops).map((s) => s.career.id);
    expect(shown).not.toContain('school-a');
    expect(shown).not.toContain('j1');
  });

  it('list fewer when there are fewer roles, and none for none', () => {
    expect(latestStops(jobs.slice(0, 2), stops)).toHaveLength(2);
    expect(latestStops([], stops)).toEqual([]);
  });

  it('skip a role whose stop is not there yet (the education is still loading)', () => {
    expect(latestStops(jobs, [])).toEqual([]);
  });
});

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The specialties of the profile that are shown.

import type { Profile } from '@/lib/content/schema';

/** The specialties that are switched on, in the order of the profile. There is none while the profile is still loading. */
export const visibleSpecialties = (
  profile: Pick<Profile, 'specialties'> | undefined | null,
): Profile['specialties'] =>
  (profile?.specialties ?? []).filter((specialty) => specialty.visible);

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { visibleSpecialties } from '@/lib/derive/specialties';

const specialty = (name: string, visible: boolean) => ({
  name,
  tone: 'primary' as const,
  visible,
});

describe('visibleSpecialties', () => {
  it('keeps the specialties that are on, in the order of the profile', () => {
    const profile = {
      specialties: [
        specialty('Mobile', true),
        specialty('Hidden', false),
        specialty('AI', true),
      ],
    };
    expect(visibleSpecialties(profile).map((s) => s.name)).toEqual([
      'Mobile',
      'AI',
    ]);
  });

  it('is empty while the profile is not there', () => {
    expect(visibleSpecialties(undefined)).toEqual([]);
    expect(visibleSpecialties(null)).toEqual([]);
    expect(visibleSpecialties({ specialties: [] })).toEqual([]);
  });
});

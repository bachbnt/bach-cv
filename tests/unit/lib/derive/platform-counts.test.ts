/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { platformCounts } from '@/lib/derive/platform-counts';

describe('platformCounts', () => {
  it('counts a project once for each platform it runs on, in the order of the platforms', () => {
    expect(
      platformCounts([
        { platforms: ['web', 'mobile'] },
        { platforms: ['mobile'] },
        { platforms: ['ai'] },
      ]),
    ).toEqual([
      { platform: 'mobile', count: 2 },
      { platform: 'web', count: 1 },
      { platform: 'ai', count: 1 },
    ]);
  });

  it('leaves out a platform with no project and gives nothing for no project', () => {
    expect(platformCounts([{ platforms: ['desktop'] }])).toEqual([
      { platform: 'desktop', count: 1 },
    ]);
    expect(platformCounts([])).toEqual([]);
    expect(platformCounts([{ platforms: [] }])).toEqual([]);
  });
});

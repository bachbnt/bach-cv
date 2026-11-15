/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { heatValue } from '@/skins/trade/blocks/data-projects-model';
import { project, skillMap } from './trade-data-fixtures';

// The order, the filters and the technologies of the screener are the page's and every skin's: `tests/unit/lib/derive/project-view.test.ts`.
const skills = skillMap('swift', 'kotlin', 'firebase');

describe('the heatmap', () => {
  it('counts the technologies a tile stands for, known skills only', () => {
    expect(
      heatValue(
        project('gamma', { technologies: ['kotlin', 'ghost'] }),
        skills,
      ),
    ).toBe(1);
    expect(heatValue(project('delta', { kind: 'personal' }), skills)).toBe(0);
  });
});

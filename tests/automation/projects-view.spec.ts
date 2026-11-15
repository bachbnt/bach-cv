/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineProjectsViewTests } from './support/projects-view-suite';

// The headings of the cards: the featured cards above the grid are the same kind of heading, so take the last ones, as many as are in the grid.
defineProjectsViewTests({
  skin: 'standard',
  names: async (page, count) =>
    (await page.getByRole('heading', { level: 3 }).allTextContents()).slice(
      -count,
    ),
});

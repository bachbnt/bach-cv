/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineProjectsViewTests } from '../support/projects-view-suite';

// In the Dev skin the cards of Featured and of the grid are the same cards: the grid is the last `count` headings of level 3.
defineProjectsViewTests({
  skin: 'dev',
  names: async (page, count) =>
    (await page.getByRole('heading', { level: 3 }).allTextContents()).slice(
      -count,
    ),
});

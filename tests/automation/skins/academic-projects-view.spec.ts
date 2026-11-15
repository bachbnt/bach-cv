/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineProjectsViewTests } from '../support/projects-view-suite';

// In the Academic skin every entry is a reference with a heading of level 3 (the featured ones above the list are the same); the number of the
// reference comes first in it and a dagger marks a featured one in the list, both only decoration.
defineProjectsViewTests({
  skin: 'academic',
  names: async (page, count) =>
    (await page.getByRole('heading', { level: 3 }).allTextContents())
      .slice(-count)
      .map((text) => text.replace(/^\d+/, '').replace(/†$/, '').trim()),
});

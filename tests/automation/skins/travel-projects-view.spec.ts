/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineProjectsViewTests } from '../support/projects-view-suite';

// In the Travel skin every postcard is a heading of level 2 and the strip is the whole list.
defineProjectsViewTests({
  skin: 'travel',
  defaultSort: 'featured',
  names: async (page, count) =>
    (await page.getByRole('heading', { level: 2 }).allTextContents()).slice(
      0,
      count,
    ),
});

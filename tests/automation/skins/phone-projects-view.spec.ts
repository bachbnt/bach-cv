/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineProjectsViewTests } from '../support/projects-view-suite';

// In the Phone skin the list is one ordered list named "All projects" whose rows each have a heading of level 3 (the open project beside it has
// its own heading of level 2, outside the list). The skin opens with the featured projects first, as Travel does.
defineProjectsViewTests({
  skin: 'phone',
  defaultSort: 'featured',
  names: async (page, count) =>
    (
      await page
        .getByRole('list', { name: 'All projects' })
        .getByRole('heading', { level: 3 })
        .allTextContents()
    ).slice(0, count),
});

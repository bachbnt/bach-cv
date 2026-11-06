/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words that only the Dev skin has on Resume (and the pages that share its blocks): the year a core skill was first used and the
 * git-style note of a degree. Everything else on those pages uses the Standard copy.
 */
export const devResumeCopy = defineCopy(
  {
    /** the line under a core skill; `{year}` is its first year in the data */
    since: 'since {year}',
    /** the note beside a degree: it is read from its dates (an end month means it is finished) */
    degree: { graduated: 'graduated', studying: 'studying' },
  },
  {
    since: 'từ {year}',
    degree: { graduated: 'đã tốt nghiệp', studying: 'đang học' },
  },
);

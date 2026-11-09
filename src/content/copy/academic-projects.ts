/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * The words only the Academic Projects page has. The rest (the title, the sections, the kinds, the links, the filter, the screenshot buttons
 * and the viewer buttons) is the Standard copy in `projects.ts`. `{n}` is the number of a reference, `{current}` and `{total}` a picture.
 */
export const academicProjectsCopy = defineCopy(
  {
    /** the label before the technologies of a project */
    builtWith: 'Built with',
    /** the label before its links */
    links: 'Links',
    /** the caption of a cover, which is a numbered figure */
    figure: 'Fig. {n}.',
    /** under the name in the viewer: `Freelance · screenshot 2 of 8` */
    screenshotOf: '{kind} · screenshot {current} of {total}',
  },
  {
    builtWith: 'Xây dựng với',
    links: 'Liên kết',
    figure: 'Hình {n}.',
    screenshotOf: '{kind} · ảnh chụp màn hình {current} / {total}',
  },
);

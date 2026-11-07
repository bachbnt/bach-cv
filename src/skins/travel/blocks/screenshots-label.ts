/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { fillCopy } from '@/components/projects/project-helpers';
import type { projectsCopy } from '@/content/copy/projects';

type ProjectsCopy = (typeof projectsCopy)['en'];

/** "6 screenshots" or "1 screenshot": the name of the button that opens a project's pictures. */
export const screenshotsLabel = (
  count: number,
  copy: Pick<ProjectsCopy, 'screenshotsOne' | 'screenshotsMany'>,
) =>
  count === 1 ? copy.screenshotsOne : fillCopy(copy.screenshotsMany, { count });

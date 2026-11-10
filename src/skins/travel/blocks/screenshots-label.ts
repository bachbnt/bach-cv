/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { projectsCopy } from '@/content/copy/projects';
import { fill } from '@/lib/chat/fill';

type ProjectsCopy = (typeof projectsCopy)['en'];

/** "6 screenshots" or "1 screenshot": the name of the button that opens a project's pictures. */
export const screenshotsLabel = (
  count: number,
  copy: Pick<ProjectsCopy, 'screenshotsOne' | 'screenshotsMany'>,
) =>
  count === 1 ? copy.screenshotsOne : fill(copy.screenshotsMany, { count });

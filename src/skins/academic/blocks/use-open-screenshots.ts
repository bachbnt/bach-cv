/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicProjectsCopy } from '@/content/copy/academic-projects';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { screenshotItems } from '@/skins/academic/blocks/project-screenshots';
import { useAcOverlays } from '@/skins/academic/shell/overlay-context';

/** Returns the function that opens a project's screenshots in the viewer, starting at the first. */
export function useOpenScreenshots() {
  const copy = useCopy(projectsCopy);
  const own = useCopy(academicProjectsCopy);
  const { openViewer } = useAcOverlays();
  return (project: Doc<'projects'>) =>
    openViewer(
      screenshotItems(project, {
        kinds: copy.kinds,
        links: copy.links,
        dialog: copy.dialog,
        screenshotOf: own.screenshotOf,
      }),
      0,
    );
}

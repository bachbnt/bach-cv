/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phoneProjectsCopy } from '@/content/copy/phone-projects';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { screenshotItems } from '@/skins/phone/blocks/project-screenshots';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';

/** Returns the function that opens a project's screenshots in the viewer, at the picture asked for (the first by default). */
export function useOpenScreenshots() {
  const copy = useCopy(projectsCopy);
  const own = useCopy(phoneProjectsCopy);
  const { openViewer } = usePhOverlays();
  return (project: Doc<'projects'>, index = 0) =>
    openViewer(
      screenshotItems(project, {
        kinds: copy.kinds,
        links: copy.links,
        dialog: copy.dialog,
        screenshotOf: own.screenshotOf,
      }),
      index,
    );
}

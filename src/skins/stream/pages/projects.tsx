/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { ProjectsContent } from '@/skins/stream/blocks/projects-content';
import { StreamPage } from '@/skins/stream/ui/stream-page';
import { StreamPageHead } from '@/skins/stream/ui/stream-page-head';

/** Projects as the Shorts page: a reel with one project at a time and the live chat beside it. */
export function ProjectsPage() {
  const copy = useCopy(projectsCopy);
  return (
    <StreamPage page='projects'>
      <StreamPageHead title={copy.title} intro={copy.intro} />
      <ProjectsContent />
    </StreamPage>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { ProjectsContent } from '@/skins/dev/blocks/projects-content';
import { DevPage } from '@/skins/dev/ui/dev-page';
import { DevPageHead } from '@/skins/dev/ui/dev-page-head';

/** Projects in the Dev skin: featured projects by rank, then every project with the kind filter. */
export function ProjectsPage() {
  const copy = useCopy(projectsCopy);
  return (
    <DevPage page='projects'>
      <DevPageHead page='projects' title={copy.title} intro={copy.intro} />
      <ProjectsContent />
    </DevPage>
  );
}

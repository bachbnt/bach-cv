/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { ProjectsContent } from '@/skins/academic/blocks/projects-content';
import { AcPage } from '@/skins/academic/ui/ac-page';
import { AcPageHead } from '@/skins/academic/ui/ac-page-head';

/** Projects in the Academic skin: the references of the manuscript, featured ones first, then all of them with the kind filter. */
export function ProjectsPage() {
  const copy = useCopy(projectsCopy);
  return (
    <AcPage page='projects'>
      <AcPageHead page='projects' title={copy.title} lead={copy.intro} />
      <ProjectsContent />
    </AcPage>
  );
}

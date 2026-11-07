/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { ProjectsBoard } from '@/skins/moba/blocks/projects-board';
import { MbPageGate } from '@/skins/moba/ui/mb-page-gate';
import { MbPageHead } from '@/skins/moba/ui/mb-page-head';

/** Projects, at the dragon pit: every project is an objective, the featured ones the big ones, each with its real screenshots. */
export function ProjectsPage() {
  const copy = useCopy(projectsCopy);
  return (
    <MbPageGate page='projects'>
      <MbPageHead title={copy.title} intro={copy.intro} />
      <ProjectsBoard />
    </MbPageGate>
  );
}

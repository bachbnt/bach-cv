/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { skillsOf } from '@/components/projects/project-helpers';
import type { Doc } from '@/lib/content/schema';
import { ProjectBody } from '@/skins/dev/blocks/project-body';
import { ProjectCover } from '@/skins/dev/blocks/project-cover';
import { DevCard } from '@/skins/dev/ui/dev-card';

/** A large card for a featured project: the cover at the left, the text at the right. */
export function FeaturedProject({
  project,
  skills,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  return (
    <DevCard
      as='article'
      data-slot='dev-project'
      className='grid grid-cols-[minmax(0,340px)_1fr] overflow-hidden p-0 max-[900px]:grid-cols-[1fr]'
      data-reveal
    >
      <ProjectCover
        project={project}
        firstSkill={skillsOf(project.technologies, skills)[0]}
        featured
        onOpen={() => onOpenScreenshots(project)}
      />
      <ProjectBody project={project} skills={skills} featured />
    </DevCard>
  );
}

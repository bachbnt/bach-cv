/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { skillsOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { ProjectBody } from '@/skins/dev/blocks/project-body';
import { ProjectCover } from '@/skins/dev/blocks/project-cover';
import { DevCard } from '@/skins/dev/ui/dev-card';
import { DevKind } from '@/skins/dev/ui/dev-kind';

/** One project in the "All projects" grid; a featured one carries the Featured tag. */
export function ProjectCard({
  project,
  skills,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  return (
    <DevCard
      as='article'
      data-slot='dev-project'
      className='flex flex-col overflow-hidden p-0'
      data-reveal
    >
      <ProjectCover
        project={project}
        firstSkill={skillsOf(project.technologies, skills)[0]}
        onOpen={() => onOpenScreenshots(project)}
      />
      <ProjectBody project={project} skills={skills}>
        {project.highlight !== null && (
          <DevKind tone='signal'>{copy.featuredTag}</DevKind>
        )}
      </ProjectBody>
    </DevCard>
  );
}

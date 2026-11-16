/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { skillsOf } from '@/components/projects/project-helpers';
import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { ProjectBody } from '@/skins/dev/blocks/project-body';
import { ProjectCover } from '@/skins/dev/blocks/project-cover';
import { DevCard } from '@/skins/dev/ui/dev-card';

/** The columns of a featured card (shared with its loading skeleton). */
export const FEATURED_CARD_GRID =
  'grid grid-cols-[minmax(0,340px)_1fr] max-[900px]:grid-cols-[1fr]';

/** The list of the featured cards (shared with the loading skeleton). */
export const FEATURED_LIST = 'grid gap-[18px]';

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
      className={cn(FEATURED_CARD_GRID, 'overflow-hidden p-0')}
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

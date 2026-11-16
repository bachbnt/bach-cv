/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { useContentQuery } from '@/lib/query/use-content';
import { ProjectSkeleton } from '@/skins/phone/blocks/project-skeleton';
import { ProjectsBrowser } from '@/skins/phone/blocks/projects-browser';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';

/** The projects and the skills they use (for the names of the technologies), with the three states of data. */
export function ProjectsContent() {
  const projectsQuery = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((skill) => [skill.id, skill])),
    [skillList],
  );
  const projects = projectsQuery.data ?? [];

  return (
    <PhDataState
      query={projectsQuery}
      count={projects.length}
      empty='projects'
      subject='projects'
      skeleton={<ProjectSkeleton />}
    >
      <ProjectsBrowser projects={projects} skills={skills} />
    </PhDataState>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { skillEvidence } from '@/lib/content/schema';
import { useContentQuery } from '@/lib/query/use-content';

/**
 * Skills in display order (featured first) with their evidence ("Used at ...", "since ...").
 * Evidence is derived from experience and projects, so all three collections are read.
 */
export function useSkills() {
  const skills = useContentQuery('skills', { featuredFirst: true });
  const experience = useContentQuery('experience');
  const projects = useContentQuery('projects');

  const evidence = useMemo(
    () => skillEvidence(experience.data ?? [], projects.data ?? []),
    [experience.data, projects.data],
  );
  const byId = useMemo(
    () => new Map((skills.data ?? []).map((skill) => [skill.id, skill])),
    [skills.data],
  );

  return {
    skills: skills.data ?? [],
    byId,
    evidence,
    isPending: skills.isPending,
    isError: skills.isError,
    refetch: skills.refetch,
  };
}

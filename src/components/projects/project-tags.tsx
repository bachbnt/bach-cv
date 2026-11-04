/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Tag } from '@/components/tag';
import { toneOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';

/** The technologies of a project as pills, coloured by the skill's category. */
export function ProjectTags({
  skills,
  className,
}: {
  skills: Doc<'skills'>[];
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  if (!skills.length) return null;
  return (
    <ul
      aria-label={copy.technologies}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {skills.map((skill) => (
        <li key={skill.id}>
          <Tag tone={toneOf(skill.category)}>{skill.name}</Tag>
        </li>
      ))}
    </ul>
  );
}

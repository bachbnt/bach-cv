/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { toneOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { DevChip } from '@/skins/dev/ui/dev-chip';

/** The technologies of a project as chips, coloured by the category of the skill. */
export function ProjectTags({ skills }: { skills: Doc<'skills'>[] }) {
  const copy = useCopy(projectsCopy);
  if (skills.length === 0) return null;
  return (
    <ul
      aria-label={copy.technologies}
      className='mt-3 flex flex-wrap gap-[7px]'
    >
      {skills.map((skill) => (
        <li key={skill.id}>
          <DevChip tone={toneOf(skill.category)}>{skill.name}</DevChip>
        </li>
      ))}
    </ul>
  );
}

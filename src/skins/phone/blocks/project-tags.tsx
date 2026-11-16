/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phoneProjectsCopy } from '@/content/copy/phone-projects';
import { projectsCopy } from '@/content/copy/projects';
import { fill } from '@/lib/chat/fill';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { firstOf } from '@/skins/phone/blocks/project-model';
import { skillHue } from '@/skins/phone/blocks/skill-hue';
import { PhChip } from '@/skins/phone/ui/ph-chip';

/** The technologies of a project as chips. With `max` only the first few show, and the number left out says so (`+3`, with its words for readers). */
export function ProjectTags({
  skills,
  max,
  className,
}: {
  skills: Doc<'skills'>[];
  max?: number;
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  const own = useCopy(phoneProjectsCopy);
  if (skills.length === 0) return null;
  const { shown, hidden } = firstOf(skills, max ?? skills.length);
  return (
    <ul
      aria-label={copy.technologies}
      className={cn('m-0 flex list-none flex-wrap gap-1.5 p-0', className)}
    >
      {shown.map((skill) => (
        <li key={skill.id}>
          <PhChip hue={skillHue(skill.category)} className='h-7 text-[13px]'>
            {skill.name}
          </PhChip>
        </li>
      ))}
      {hidden > 0 && (
        <li>
          <PhChip
            role='img'
            aria-label={fill(own.moreTech, { count: hidden })}
            className='h-7 text-[13px] text-ph-mute'
          >
            +{hidden}
          </PhChip>
        </li>
      )}
    </ul>
  );
}

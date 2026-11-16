/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { skillHue } from '@/skins/phone/blocks/skill-hue';
import { PhChip } from '@/skins/phone/ui/ph-chip';

/** The technologies of a role or a degree as chips. A skill the site does not list (or that is switched off) is left out, as in Standard. */
export function ResumeTags({
  ids,
  skills,
  className,
}: {
  ids: string[];
  skills: Map<string, Doc<'skills'>>;
  className?: string;
}) {
  const known = ids.flatMap((id) => skills.get(id) ?? []);
  if (known.length === 0) return null;
  return (
    <ul className={cn('m-0 flex list-none flex-wrap gap-2 p-0', className)}>
      {known.map((skill) => (
        <li key={skill.id}>
          <PhChip
            hue={skillHue(skill.category)}
            className='h-7 px-3 text-[13px]'
          >
            {skill.name}
          </PhChip>
        </li>
      ))}
    </ul>
  );
}

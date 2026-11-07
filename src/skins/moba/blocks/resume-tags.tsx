/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Skill } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { MbChip } from '@/skins/moba/ui/mb-chip';

/**
 * The technologies of a role or a degree as chips coloured by area. Unlisted skills show here too: `listed` only decides whether a skill
 * has a tile in the Skills section. An id that is not a skill is left out.
 */
export function ResumeTags({
  ids,
  skills,
  className,
}: {
  ids: string[];
  skills: Map<string, Skill>;
  className?: string;
}) {
  const known = ids.flatMap((id) => {
    const skill = skills.get(id);
    return skill ? [{ id, skill }] : [];
  });
  if (!known.length) return null;
  return (
    <ul className={cn('m-0 flex list-none flex-wrap gap-1.5 p-0', className)}>
      {known.map(({ id, skill }) => (
        <li key={id}>
          <MbChip tone={skill.category}>{skill.name}</MbChip>
        </li>
      ))}
    </ul>
  );
}

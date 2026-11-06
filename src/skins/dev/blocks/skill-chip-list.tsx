/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Skill } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { devChipVariants } from '@/skins/dev/ui/dev-chip';

/**
 * The technologies of an item as a list of plain chips, coloured by the category of the skill. An id that is not a skill is left
 * out. Unlisted skills still show here: `listed` only decides whether a skill is a chip in the Skills section.
 */
export function DevSkillChipList({
  ids,
  skills,
  label,
  className,
}: {
  ids: string[];
  skills: Map<string, Skill>;
  label?: string;
  className?: string;
}) {
  const known = ids.flatMap((id) => {
    const skill = skills.get(id);
    return skill ? [{ id, skill }] : [];
  });
  if (!known.length) return null;
  return (
    <ul
      aria-label={label}
      className={cn('mt-3 flex flex-wrap gap-[7px]', className)}
    >
      {known.map(({ id, skill }) => (
        <li
          key={id}
          data-slot='dev-chip'
          className={devChipVariants({ tone: skill.category })}
        >
          {skill.name}
        </li>
      ))}
    </ul>
  );
}

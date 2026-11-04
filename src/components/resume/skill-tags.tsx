/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Tag } from '@/components/tag';
import type { Skill } from '@/lib/content/schema';
import { cn } from 'cn';

/**
 * The technologies of an item as tags, coloured by skill category.
 * Unlisted skills still show here: `listed` only decides whether a skill is a chip in the Skills section.
 */
export function SkillTags({
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
    <ul className={cn('m-0 flex list-none flex-wrap gap-2 p-0', className)}>
      {known.map(({ id, skill }) => (
        <li key={id}>
          <Tag tone={skill.category}>{skill.name}</Tag>
        </li>
      ))}
    </ul>
  );
}

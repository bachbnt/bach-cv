/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Skill } from '@/lib/content/schema';
import { cn } from '@/lib/utils';

/** The chalk of each area of skills: the same colour in the tags, the table and the core stack. */
export const AREA_INK: Record<Skill['category'], string> = {
  ai: 'text-ac-mb',
  mobile: 'text-ac-ma',
  web: 'text-ac-mc',
  tools: 'text-ac-md',
};

/**
 * The technologies of a role or a thesis as hand-outlined tags, coloured by the area of the skill. A skill that is not listed still shows
 * here (`listed` only decides whether it is a row of the skills table), as in Standard.
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
    <ul className={cn('m-0 flex list-none flex-wrap gap-2 p-0', className)}>
      {known.map(({ id, skill }) => (
        <li
          key={id}
          className={cn(
            'rounded-[10px_6px_11px_7px/7px_11px_6px_10px] border-2 border-current px-2.5 pt-px pb-[3px] font-ac-note text-[15.5px]/[1.3]',
            AREA_INK[skill.category],
          )}
        >
          {skill.name}
        </li>
      ))}
    </ul>
  );
}

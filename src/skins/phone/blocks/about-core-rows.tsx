/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { SkillIcon } from '@/components/skills/skill-icon';
import { evidenceLine } from '@/components/skills/skill-text';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc } from '@/lib/content/schema';
import type { SkillEvidence } from '@/lib/derive/skill-use';
import { useCopy } from '@/lib/i18n/copy';
import { ROW_SEPARATOR } from '@/skins/phone/blocks/list-row';
import { cn } from '@/lib/utils';
import { PhCard } from '@/skins/phone/ui/ph-card';

/** The skills of the core stack (already in rank order) as a list of rows: the mark, the name and where it was used, as Standard's cards say. */
export function AboutCoreRows({
  skills,
  evidence,
}: {
  skills: Doc<'skills'>[];
  evidence: Map<string, SkillEvidence>;
}) {
  const copy = useCopy(resumeCopy);
  return (
    <PhCard className='p-0'>
      <ul className='m-0 list-none p-0'>
        {skills.map((skill) => {
          const line = evidenceLine(
            evidence.get(skill.id),
            copy.skills.evidence,
          );
          return (
            <li
              key={skill.id}
              className={cn(
                ROW_SEPARATOR,
                '[--inset:74px] flex items-center gap-3.5 px-4 py-3',
              )}
            >
              <span className='grid size-11 shrink-0 place-items-center rounded-ph-inner bg-ph-sheet-3 text-ph-ink'>
                <SkillIcon
                  icon={skill.icon}
                  name={skill.name}
                  className='size-6 items-center justify-center text-base font-bold'
                />
              </span>
              <span className='min-w-0'>
                <span className='block text-[16px]/[1.3] font-semibold'>
                  {skill.name}
                </span>
                {line && (
                  <span className='mt-0.5 block text-[14px]/[1.45] text-ph-mute'>
                    {line}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </PhCard>
  );
}

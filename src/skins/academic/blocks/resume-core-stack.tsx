/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { evidenceLine } from '@/components/skills/skill-text';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { AREA_INK } from '@/skins/academic/blocks/resume-tags';
import type { SkillRow } from '@/skins/academic/blocks/resume-skills-model';
import { cn } from '@/lib/utils';
import { coreStack } from '@/lib/derive/core-stack';

/** The core stack: the skills marked `highlight`, in rank order, each with where it was used (Standard's cards, as a list of chalk lines). */
export function ResumeCoreStack({ rows }: { rows: SkillRow[] }) {
  const { skills } = useCopy(resumeCopy);
  const byId = new Map(rows.map((row) => [row.skill.id, row]));
  const core = coreStack(rows.map((row) => row.skill)).flatMap(
    (skill) => byId.get(skill.id) ?? [],
  );
  if (!core.length) return null;
  return (
    <ul className='m-0 mt-4 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-x-6 gap-y-4 p-0'>
      {core.map(({ skill, evidence }) => {
        const line = evidenceLine(evidence, skills.evidence);
        return (
          <li
            key={skill.id}
            className={cn(
              'border-l-[3px] border-current pl-3',
              AREA_INK[skill.category],
            )}
          >
            <span className='block font-ac-chalk text-[24px]/[1.15] text-ac-ink'>
              {skill.name}
            </span>
            {line && (
              <span className='block text-[15.5px]/[1.35] text-ac-mute'>
                {line}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

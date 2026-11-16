/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSkills } from '@/components/skills/use-skills';
import { tipText } from '@/components/skills/skill-text';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { resumeCopy } from '@/content/copy/resume';
import { useNow } from '@/hooks/use-now';
import { lengthOfMonths } from '@/lib/derive/career-months';
import { lengthLabel } from '@/lib/derive/duration-label';
import { skillGroups } from '@/lib/derive/skill-groups';
import { skillRows } from '@/lib/derive/skill-rows';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { ROW_SEPARATOR } from '@/skins/phone/blocks/list-row';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhChip } from '@/skins/phone/ui/ph-chip';
import { RESUME_CARDS_GRID } from '@/skins/phone/blocks/resume-layout';
import { ResumeSkillGroupsSkeleton } from '@/skins/phone/blocks/resume-skill-groups-skeleton';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';

/**
 * Every listed skill by area, one card for each area: the name (the core stack is bold and marked), where it was used and since when (the
 * words of Standard's tip, shown, because a phone has no hover) and for how long it was in use (`monthsUsed`, overlaps once).
 */
export function ResumeSkillGroups() {
  const copy = useCopy(resumeCopy).skills;
  const words = useCopy(phoneHomeCopy).resume;
  const now = useNow();
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const jobs = useContentQuery('experience');
  const rows = new Map(
    skillRows(skills, jobs.data ?? [], evidence, now).map((row) => [
      row.skill.id,
      row,
    ]),
  );
  const groups = skillGroups(skills);

  return (
    <PhDataState
      query={{ isPending, isError, refetch }}
      count={groups.length}
      empty='skills'
      subject='skills'
      level={3}
      skeleton={<ResumeSkillGroupsSkeleton />}
    >
      <div className={RESUME_CARDS_GRID}>
        {groups.map(({ category, items }) => (
          <PhCard key={category} className='p-0'>
            <div className='flex items-center justify-between gap-3 px-4 pt-4 pb-2'>
              <h4 className='text-[17px]/[1.3] font-bold'>
                {copy.groups[category]}
              </h4>
              <span className='text-[13px] text-ph-mute tabular-nums'>
                {items.length}
              </span>
            </div>
            <ul className='m-0 list-none p-0'>
              {items.map((skill) => {
                const row = rows.get(skill.id);
                const core = skill.highlight !== null;
                const line = row?.evidence?.usedAt.length
                  ? tipText(row.evidence, copy.tip)
                  : '';
                return (
                  <li
                    key={skill.id}
                    className={cn(
                      ROW_SEPARATOR,
                      '[--inset:16px] flex items-start gap-3 px-4 py-3',
                    )}
                  >
                    <span className='min-w-0 flex-1'>
                      <span className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                        <span
                          className={cn(
                            'text-[16px]/[1.35]',
                            core ? 'font-bold' : 'font-medium',
                          )}
                        >
                          {skill.name}
                        </span>
                        {core && (
                          <PhChip tone='accent'>{copy.core.title}</PhChip>
                        )}
                      </span>
                      {line && (
                        <span className='mt-0.5 block text-[14px]/[1.5] text-ph-mute'>
                          {line}
                        </span>
                      )}
                    </span>
                    {row && row.months > 0 && (
                      <span className='shrink-0 pt-0.5 text-right text-[14px]/[1.35] font-semibold whitespace-nowrap text-ph-mute tabular-nums'>
                        <span className='sr-only'>{words.usedFor} </span>
                        {lengthLabel(lengthOfMonths(row.months), words)}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </PhCard>
        ))}
      </div>
    </PhDataState>
  );
}

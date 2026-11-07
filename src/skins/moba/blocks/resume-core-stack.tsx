/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { evidenceLine } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { mobaResumeCopy } from '@/content/copy/moba-resume';
import { resumeCopy } from '@/content/copy/resume';
import { fill } from '@/lib/chat/fill';
import { careerMonthCount, careerShare } from '@/lib/derive/career-length';
import { coreSkills } from '@/lib/derive/core-skills';
import { formatUsed } from '@/lib/derive/duration-label';
import { monthsUsed } from '@/lib/derive/skill-use';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { ABILITY_KEYS } from '@/skins/moba/config';
import { MbCard } from '@/skins/moba/ui/mb-card';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbKbd } from '@/skins/moba/ui/mb-kbd';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';
import { useMemo } from 'react';

/**
 * The core stack as key skills: every highlighted skill in rank order, a tile with its mark, its name, where it was used and how long it
 * has been in use (the share of the career that the roles listing it cover, as a bar). The first four wear the key caps Q W E R that
 * work them on the champion bar; the rest have none. The Resume and the About page both show it.
 */
export function ResumeCoreStack({ className }: { className?: string }) {
  const copy = useCopy(resumeCopy);
  const mb = useCopy(mobaResumeCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const { data: jobs } = useContentQuery('experience');
  const now = useMemo(() => new Date(), []);
  const core = coreSkills(skills);
  const careerMonths = careerMonthCount(
    (jobs ?? []).map((job) => job.startMonth),
    now,
  );

  return (
    <MbDataState
      query={{ isPending, isError, refetch }}
      count={core.length}
      empty='coreStack'
      subject='coreStack'
      level={3}
      className={className}
      skeleton={
        <div className={cn('grid gap-3 min-[640px]:grid-cols-2', className)}>
          {[0, 1, 2, 3].map((i) => (
            <MbSkeleton key={i} className='h-[96px]' />
          ))}
        </div>
      }
    >
      <ul
        className={cn(
          'm-0 grid list-none gap-3 p-0 min-[640px]:grid-cols-2',
          className,
        )}
      >
        {core.map((skill, index) => {
          const color = SKILL_COLORS[skill.icon];
          const line = evidenceLine(
            evidence.get(skill.id),
            copy.skills.evidence,
          );
          const months = jobs ? monthsUsed(skill.id, jobs, now) : 0;
          const key = ABILITY_KEYS[index];
          return (
            <li key={skill.id}>
              <MbCard
                data-skill={skill.id}
                style={color ? ({ '--c': color } as CSSProperties) : undefined}
                className='mb-core h-full'
              >
                <article className='flex h-full items-start gap-3.5 px-4 py-3.5'>
                  <span className='mb-orb grid size-14 flex-none place-items-center'>
                    <span className='mb-orb-in grid place-items-center'>
                      <SkillIcon
                        icon={skill.icon}
                        name={skill.name}
                        className='size-7 font-mb-display text-lg'
                      />
                    </span>
                  </span>
                  <div className='min-w-0 flex-1'>
                    <h4 className='text-[19px] leading-[1.15] text-mb-title'>
                      {skill.name}
                    </h4>
                    {line && (
                      <p className='mt-1 text-[13.5px] leading-[1.4] text-mb-mute'>
                        {line}
                      </p>
                    )}
                    {months > 0 && (
                      <div className='mt-2.5'>
                        <p className='text-[12px] leading-none font-bold text-mb-teal-ink'>
                          {fill(mb.used, {
                            time: formatUsed(months, mb.units),
                          })}
                        </p>
                        <span
                          aria-hidden='true'
                          className='mb-used mt-1.5 block'
                        >
                          <span
                            className='mb-used-fill block'
                            style={
                              {
                                '--w': `${Math.round(careerShare(months, careerMonths) * 100)}%`,
                              } as CSSProperties
                            }
                          />
                        </span>
                      </div>
                    )}
                  </div>
                  {key && <MbKbd className='flex-none'>{key}</MbKbd>}
                </article>
              </MbCard>
            </li>
          );
        })}
      </ul>
    </MbDataState>
  );
}

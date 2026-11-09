/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { evidenceLine } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { aboutCopy } from '@/content/copy/about';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { HomeCol } from '@/skins/academic/blocks/home-col';
import { AcDataState } from '@/skins/academic/ui/ac-data-state';
import { AcHeading } from '@/skins/academic/ui/ac-section';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { coreStack } from '@/lib/derive/core-stack';

/**
 * The skills I use every day, as small cards taped to the board (the skills marked `highlight`, in rank order, with where each was used), and the link to
 * the whole list on Resume. The same data and words as Standard's core stack.
 */
export function AboutCoreStack() {
  const { core } = useCopy(aboutCopy);
  const copy = useCopy(resumeCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const stack = coreStack(skills);

  return (
    <HomeCol className='mt-16'>
      <section aria-labelledby='core-h'>
        <div className='flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2'>
          <AcHeading id='core-h'>{core.title}</AcHeading>
          <Link
            href='/resume#skills'
            className='font-ac-note text-[19px] text-ac-link underline underline-offset-4 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
          >
            {core.all}
          </Link>
        </div>
        <p className='mt-3 mb-7 max-w-[56ch] text-ac-mute'>{core.lead}</p>
        <AcDataState
          query={{ isPending, isError, refetch }}
          count={stack.length}
          empty='coreStack'
          subject='coreStack'
          level={3}
          skeleton={
            <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-5'>
              {Array.from({ length: 4 }, (_, i) => (
                <AcSkeleton key={i} className='h-[120px]' />
              ))}
            </div>
          }
        >
          <ul className='m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-x-5 gap-y-7 p-0'>
            {stack.map((skill, index) => {
              const color = SKILL_COLORS[skill.icon];
              const line = evidenceLine(
                evidence.get(skill.id),
                copy.skills.evidence,
              );
              return (
                <li key={skill.id}>
                  <article
                    style={
                      {
                        '--c': color ?? 'var(--ac-sheet-ink)',
                        rotate: `${index % 2 ? 0.7 : -0.6}deg`,
                      } as CSSProperties
                    }
                    className='ac-paper ac-tape flex h-full flex-col gap-3 rounded-[2px] px-4 pt-5 pb-4'
                  >
                    <span className='grid size-10 flex-none place-items-center rounded-[10px_5px_11px_6px/6px_11px_5px_10px] border-2 border-(--c) text-(--c)'>
                      <SkillIcon
                        icon={skill.icon}
                        name={skill.name}
                        className='size-6 items-center justify-center font-ac-chalk text-base'
                      />
                    </span>
                    <div>
                      <h3 className='m-0 font-ac-chalk text-[24px]/[1.15] font-normal'>
                        {skill.name}
                      </h3>
                      {line && (
                        <p className='mt-1 mb-0 text-[0.84em]/[1.4] text-ac-mute'>
                          {line}
                        </p>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        </AcDataState>
      </section>
    </HomeCol>
  );
}

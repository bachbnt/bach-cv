/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Pin } from 'lucide-react';
import type { CSSProperties } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { SkillTip } from '@/components/skills/skill-tip';
import { evidenceLine } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { careerCopy } from '@/content/copy/stream-career';
import { resumeCopy } from '@/content/copy/resume';
import { SKILL_CATEGORIES } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { useSkillTip } from '@/skins/stream/blocks/career-use-skill-tip';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamHeading } from '@/skins/stream/ui/stream-heading';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/** AI first, as in Standard. */
const ORDER = [
  'ai',
  'mobile',
  'web',
  'tools',
] as const satisfies readonly (typeof SKILL_CATEGORIES)[number][];

/**
 * The Skills section of Resume: the core stack as the comment a channel pins (a list of rows, each with the mark of the skill and where
 * I used it), then every listed skill as hashtags, one cloud for each area. The core ones are bigger and bold; hovering, focusing or
 * tapping a hashtag shows Standard's tip ("Used at FPT, MoMo. First used 2022.").
 */
export function CareerSkills() {
  const copy = useCopy(resumeCopy);
  const career = useCopy(careerCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const { tip, props } = useSkillTip(evidence, copy.skills.tip);
  const query = { isPending, isError, refetch };
  const core = skills.filter((skill) => skill.listed && skill.highlight);
  const groups = ORDER.map((category) => ({
    category,
    items: skills.filter((s) => s.listed && s.category === category),
  })).filter((group) => group.items.length);

  return (
    <section
      id='skills'
      aria-labelledby='skills-h'
      className='mt-12 scroll-mt-20 px-3 min-[701px]:px-0'
    >
      <StreamHeading id='skills-h' className='mb-1'>
        {copy.skills.title}
      </StreamHeading>
      <p className='max-w-[640px] text-sm text-sm-mute'>{copy.skills.lead}</p>

      <div className='mt-5 rounded-xl border border-sm-line border-l-4 border-l-sm-red bg-sm-surface p-4 min-[701px]:p-5'>
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
          <span className='inline-flex items-center gap-1 text-xs font-medium text-sm-mute'>
            <Pin aria-hidden='true' className='size-3.5 -rotate-45' />
            {career.pinned}
          </span>
          <h3 className='text-base font-bold'>{copy.skills.core.title}</h3>
          <p className='text-[13px] text-sm-mute'>{copy.skills.core.lead}</p>
        </div>
        <StreamDataState
          query={query}
          count={core.length}
          empty='coreStack'
          subject='coreStack'
          level={3}
          className='mt-4'
          skeleton={
            <div className='grid gap-3 min-[701px]:grid-cols-2'>
              {Array.from({ length: 4 }, (_, i) => (
                <StreamSkeleton key={i} className='h-12' />
              ))}
            </div>
          }
        >
          <ul className='m-0 mt-4 grid list-none gap-x-8 p-0 min-[701px]:grid-cols-2'>
            {core.map((skill) => {
              const color = SKILL_COLORS[skill.icon];
              const line = evidenceLine(
                evidence.get(skill.id),
                copy.skills.evidence,
              );
              return (
                <li
                  key={skill.id}
                  style={
                    color ? ({ '--c': color } as CSSProperties) : undefined
                  }
                  className='flex items-center gap-3 border-t border-sm-line py-2.5 first:border-t-0 min-[701px]:nth-2:border-t-0'
                >
                  <span className='grid size-10 flex-none place-items-center rounded-full bg-[color-mix(in_srgb,var(--c,var(--sm-ink))_16%,var(--sm-hover))] text-[color-mix(in_srgb,var(--c,var(--sm-ink))_75%,var(--sm-ink))]'>
                    <SkillIcon
                      icon={skill.icon}
                      name={skill.name}
                      className='size-5 text-base'
                    />
                  </span>
                  <div className='min-w-0'>
                    <h4 className='truncate text-sm font-medium'>
                      {skill.name}
                    </h4>
                    {line && (
                      <p className='line-clamp-2 text-xs/[1.35] text-sm-mute'>
                        {line}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </StreamDataState>
      </div>

      <div className='mt-8 mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-0.5'>
        <h3 className='text-base font-bold'>{copy.skills.all.title}</h3>
        <p className='text-[13px] text-sm-mute'>{copy.skills.all.lead}</p>
      </div>
      <StreamDataState
        query={query}
        count={groups.length}
        empty='skills'
        subject='skills'
        level={3}
        skeleton={
          <div className='grid gap-4 min-[701px]:grid-cols-2'>
            {Array.from({ length: 4 }, (_, i) => (
              <StreamSkeleton key={i} className='h-28' />
            ))}
          </div>
        }
      >
        <div className='grid gap-x-10 gap-y-6 min-[701px]:grid-cols-2'>
          {groups.map(({ category, items }) => (
            <section key={category} aria-labelledby={`area-${category}`}>
              <h3
                id={`area-${category}`}
                className='flex items-baseline gap-2 border-b border-sm-line pb-1.5 text-sm font-bold'
              >
                {copy.skills.groups[category]}
                <span className='text-xs font-normal text-sm-mute'>
                  {items.length}
                </span>
              </h3>
              <ul className='m-0 mt-3 flex list-none flex-wrap items-baseline gap-x-1 gap-y-0.5 p-0'>
                {items.map((skill) => (
                  <li key={skill.id}>
                    <button
                      type='button'
                      {...props(skill)}
                      className={cn(
                        'inline-flex min-h-7 cursor-help items-center rounded-md px-1.5 text-sm-blue transition-colors hover:bg-sm-hover pointer-coarse:min-h-11 pointer-coarse:px-2',
                        skill.highlight !== null
                          ? 'text-lg font-bold'
                          : 'text-sm font-medium',
                        tip?.id === skill.id && 'bg-sm-hover',
                      )}
                    >
                      <span aria-hidden='true'>#</span>
                      {skill.name}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </StreamDataState>
      {tip && <SkillTip tip={tip} />}
    </section>
  );
}

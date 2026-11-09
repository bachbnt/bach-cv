/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { SIDE_PROJECTS } from '@/lib/derive/skill-use';
import { useSkills } from '@/components/skills/use-skills';
import { devResumeCopy } from '@/content/copy/dev-resume-certificates';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DevCardsSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';
import { DevCard } from '@/skins/dev/ui/dev-card';
import { coreStack } from '@/lib/derive/core-stack';

/** The grid has three columns: when the first card spans two of them the rows are full only for 5, 8, 11 ... cards. */
const fillsWithMain = (count: number) => (count + 1) % 3 === 0;

/** a card: the colour of the skill (`--c`) is its top edge, its glow and its hover */
const CARD =
  'relative flex flex-col gap-3 overflow-hidden border-t-2 border-t-(--c) px-[18px] py-4 hover:border-(color:--c) hover:shadow-[0_16px_36px_color-mix(in_srgb,var(--c)_22%,transparent)] after:pointer-events-none after:absolute after:-top-10 after:-right-10 after:size-[130px] after:rounded-full after:bg-[radial-gradient(circle,color-mix(in_srgb,var(--c)_28%,transparent),transparent_70%)] after:opacity-55 after:transition-[opacity,transform] after:duration-[300ms,400ms] after:ease-[ease] after:content-[""] hover:after:opacity-100 hover:after:[transform:scale(1.25)]';
const CARD_MAIN =
  'col-span-2 max-[900px]:col-[1/-1] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--c)_14%,var(--chrome)),var(--chrome)_55%)] px-[22px] py-5';

/**
 * The skills marked `highlight`, in rank order, as cards: the mark, the name, the year it was first used and the places it was
 * used. It reads its own data, so a page just drops it in (About and Resume do) and adds the heading around it.
 */
export function DevCoreStack() {
  const copy = useCopy(resumeCopy);
  const dev = useCopy(devResumeCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const core = coreStack(skills);
  const hasMain = fillsWithMain(core.length);

  return (
    <DevDataState
      query={{ isPending, isError, refetch }}
      count={core.length}
      empty='coreStack'
      subject='coreStack'
      level={3}
      skeleton={<DevCardsSkeleton count={5} min={220} height={150} />}
    >
      <div
        // `dv-core-grid` is only a hook for the tests
        className='dv-core-grid grid grid-cols-[repeat(3,minmax(0,1fr))] gap-4 max-[900px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[620px]:grid-cols-[minmax(0,1fr)]'
      >
        {core.map((skill, i) => {
          const found = evidence.get(skill.id);
          const main = hasMain && i === 0;
          const places = (found?.usedAt ?? []).map((label) =>
            label === SIDE_PROJECTS ? copy.skills.evidence.sideProjects : label,
          );
          return (
            <DevCard
              as='article'
              key={skill.id}
              className={cn(CARD, main && CARD_MAIN)}
              style={
                {
                  '--c': SKILL_COLORS[skill.icon] ?? 'var(--and)',
                  '--i': i,
                } as CSSProperties
              }
              data-reveal
            >
              <div className='flex items-center gap-3'>
                <span
                  className={cn(
                    'grid flex-none place-items-center rounded-[10px] border border-[color:color-mix(in_srgb,var(--c)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--c)_18%,transparent)] font-code font-bold text-[color:color-mix(in_srgb,var(--c)_58%,var(--head))]',
                    main
                      ? 'size-12 text-[21px]/[normal]'
                      : 'size-10 text-[17px]/[normal]',
                  )}
                >
                  <SkillIcon
                    icon={skill.icon}
                    name={skill.name}
                    className={cn(
                      'items-center justify-center font-code text-[15px]/[normal] font-bold',
                      main ? 'size-[26px]' : 'size-[22px]',
                    )}
                  />
                </span>
                <div>
                  <h3
                    className={cn(
                      'mb-1.5',
                      // important: `[data-slot='dev-card'] h3` in dev.css still sets 16px
                      main ? 'text-[24px]/[1.2]!' : 'text-[16px]/[1.2]',
                    )}
                  >
                    {skill.name}
                  </h3>
                  {found?.since != null && (
                    <span className='font-code text-[12px] leading-[normal] text-mute'>
                      {dev.since.replace('{year}', String(found.since))}
                    </span>
                  )}
                </div>
              </div>
              {places.length > 0 && (
                <div className='flex flex-wrap items-center gap-1.5 font-code text-[12px] leading-[normal] text-dim'>
                  <span>{copy.skills.evidence.usedAt}</span>
                  {places.map((place) => (
                    <i
                      key={place}
                      className='rounded-full border border-[color:color-mix(in_srgb,var(--c)_40%,transparent)] px-[9px] py-px text-[color:color-mix(in_srgb,var(--c)_58%,var(--head))] not-italic'
                    >
                      {place}
                    </i>
                  ))}
                </div>
              )}
            </DevCard>
          );
        })}
      </div>
    </DevDataState>
  );
}

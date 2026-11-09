/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { tipText } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { SKILL_CATEGORIES, type Skill } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { STOP_OF_CATEGORY } from '@/skins/travel/blocks/postcard-model';
import { TlDataState } from '@/skins/travel/ui/tl-data-state';
import { TlSkeleton } from '@/skins/travel/ui/tl-skeleton';

const ORDER = [
  'ai',
  'mobile',
  'web',
  'tools',
] as const satisfies readonly (typeof SKILL_CATEGORIES)[number][];

/**
 * The packing list: the skills of Standard's Skills section. The core stack (what is used every day) is the cabin bag, all the skills
 * by area are the suitcases. Standard shows where a skill was used in a tip on hover or focus; here a skill is a button and its
 * "used at ... first used ..." line shows under the list, so a keyboard or a finger reads the same words.
 */
export function TripLuggage({ coreOnly = false }: { coreOnly?: boolean }) {
  const copy = useCopy(resumeCopy).skills;
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const [pickedId, setPickedId] = useState<string | null>(null);
  const picked = skills.find((s) => s.id === pickedId);
  const core = skills.filter((s) => s.listed && s.highlight);
  const groups = ORDER.map((category) => ({
    category,
    items: skills.filter((s) => s.listed && s.category === category),
  })).filter((g) => g.items.length);

  const chip = (skill: Skill & { id: string }, isCore: boolean) => (
    <li key={skill.id}>
      <button
        type='button'
        aria-pressed={pickedId === skill.id}
        onClick={() => setPickedId((id) => (id === skill.id ? null : skill.id))}
        style={
          {
            '--tl-pc': `var(--tl-stop-${STOP_OF_CATEGORY[skill.category]})`,
          } as React.CSSProperties
        }
        className={cn(
          'inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[color-mix(in_srgb,var(--tl-pc)_32%,transparent)] bg-[color-mix(in_srgb,var(--tl-pc)_14%,transparent)] px-2.5 py-1 text-[13px] pointer-coarse:min-h-11 aria-pressed:bg-[color-mix(in_srgb,var(--tl-pc)_34%,transparent)]',
          isCore ? 'font-extrabold' : 'font-semibold',
        )}
      >
        <SkillIcon
          icon={skill.icon}
          name={skill.name}
          className='size-3.5 flex-none'
        />
        {skill.name}
      </button>
    </li>
  );

  return (
    <TlDataState
      query={{ isPending, isError, refetch }}
      count={core.length || groups.length}
      empty='skills'
      subject='skills'
      level={3}
      skeleton={<TlSkeleton className='h-40' />}
    >
      <div>
        <h3 className='m-0 text-[13px] font-extrabold tracking-[0.9px] text-tl-muted uppercase'>
          {copy.core.title}
        </h3>
        <p className='m-0 mb-2 text-[12.5px] text-tl-muted'>{copy.core.lead}</p>
        <ul className='m-0 flex list-none flex-wrap gap-1.5 p-0'>
          {core.map((s) => chip(s, true))}
        </ul>
        {!coreOnly &&
          groups.map(({ category, items }) => (
            <section
              key={category}
              aria-label={copy.groups[category]}
              className='mt-4'
            >
              <h4 className='m-0 mb-1.5 flex items-center gap-2 text-[13px] font-extrabold'>
                {copy.groups[category]}
                <span className='ml-auto text-xs font-semibold text-tl-muted'>
                  {items.length}
                </span>
              </h4>
              <ul className='m-0 flex list-none flex-wrap gap-1.5 p-0'>
                {items.map((s) => chip(s, Boolean(s.highlight)))}
              </ul>
            </section>
          ))}
        <div role='status'>
          {picked && (
            <p className='mt-3 rounded-xl bg-tl-chip px-3 py-2 text-[13px] text-tl-chip-ink'>
              <b>{picked.name}.</b> {tipText(evidence.get(picked.id), copy.tip)}
            </p>
          )}
        </div>
      </div>
    </TlDataState>
  );
}

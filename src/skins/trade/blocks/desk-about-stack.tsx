/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { evidenceLine } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { aboutCopy } from '@/content/copy/about';
import { resumeCopy } from '@/content/copy/resume';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { useCopy } from '@/lib/i18n/copy';
import { DeskSection } from '@/skins/trade/blocks/desk-section';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';
import { cssVars } from '@/skins/trade/ui/css-vars';

/**
 * The core stack as the composition of a symbol: one tile for each skill I use every day, with where I used it, and the link to the full list.
 * The strip of colours above the tiles is decoration (equal parts, no numbers).
 */
export function DeskAboutStack() {
  const { core: copy } = useCopy(aboutCopy);
  const kicker = useCopy(tradeDeskCopy).about.composition;
  const resume = useCopy(resumeCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const core = skills.filter((skill) => skill.listed && skill.highlight);

  return (
    <DeskSection
      id='tv-core'
      title={copy.title}
      kicker={kicker}
      actions={
        <Link
          href='/resume#skills'
          data-slot='tv-link'
          className='text-[13px] font-medium text-tv-accent-ink underline-offset-[3px] hover:underline pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
        >
          {copy.all}
        </Link>
      }
    >
      <p className='mb-3 max-w-[620px] text-xs/[1.5] text-tv-mute'>
        {copy.lead}
      </p>
      <TvDataState
        query={{ isPending, isError, refetch }}
        count={core.length}
        empty='coreStack'
        subject='coreStack'
        level={3}
        skeleton={
          <div className='grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2'>
            {Array.from({ length: 4 }, (_, i) => (
              <TvSkeleton key={i} className='h-20' />
            ))}
          </div>
        }
      >
        <div
          aria-hidden='true'
          className='mb-2 flex h-1.5 gap-0.5 overflow-hidden rounded-full'
        >
          {core.map((skill) => (
            <span
              key={skill.id}
              style={cssVars({ '--c': SKILL_COLORS[skill.icon] })}
              className='h-full flex-1 bg-(--c,var(--tv-accent))'
            />
          ))}
        </div>
        <ul className='m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2 p-0'>
          {core.map((skill) => {
            const color = SKILL_COLORS[skill.icon];
            const line = evidenceLine(
              evidence.get(skill.id),
              resume.skills.evidence,
            );
            return (
              <li
                key={skill.id}
                style={cssVars({ '--c': color })}
                className='flex gap-2.5 rounded border border-tv-line border-t-2 border-t-(--c,var(--tv-accent)) bg-tv-bg p-2.5'
              >
                <span className='grid size-8 flex-none place-items-center rounded bg-[color-mix(in_srgb,var(--c,var(--tv-accent))_15%,transparent)] text-[color-mix(in_srgb,var(--c,var(--tv-accent))_70%,var(--tv-ink))]'>
                  <SkillIcon
                    icon={skill.icon}
                    name={skill.name}
                    className='size-5 text-sm'
                  />
                </span>
                <div className='min-w-0'>
                  <h3 className='text-[13px]/tight font-semibold'>
                    {skill.name}
                  </h3>
                  {line && (
                    <p className='mt-0.5 text-xs/[1.4] text-tv-mute'>{line}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </TvDataState>
    </DeskSection>
  );
}

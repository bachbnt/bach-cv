/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { evidenceLine } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { aboutCopy } from '@/content/copy/about';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamHeading } from '@/skins/stream/ui/stream-heading';
import { StreamLink } from '@/skins/stream/ui/stream-link';
import { StreamCardsSkeleton } from '@/skins/stream/ui/stream-skeleton';

/**
 * The second tab of the channel: the skills I use every day as a grid of videos. Each one has a 16:9 picture (the mark of the skill on a
 * wash of its own colour) and, under it, the name and the Standard "Used at ..." line, with the link to the full list on Resume.
 */
export function AboutCoreStack() {
  const { core } = useCopy(aboutCopy);
  const resume = useCopy(resumeCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const stack = skills.filter((skill) => skill.listed && skill.highlight);

  return (
    <section aria-labelledby='core-h' className='px-3 py-6 min-[701px]:px-0'>
      <StreamHeading
        id='core-h'
        className='mb-1'
        action={<StreamLink href='/resume#skills'>{core.all}</StreamLink>}
      >
        {core.title}
      </StreamHeading>
      <p className='mb-5 max-w-[640px] text-sm text-sm-mute'>{core.lead}</p>
      <StreamDataState
        query={{ isPending, isError, refetch }}
        count={stack.length}
        empty='coreStack'
        subject='coreStack'
        level={3}
        skeleton={<StreamCardsSkeleton count={8} min={200} />}
      >
        <ul className='m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-x-4 gap-y-6 p-0'>
          {stack.map((skill) => {
            const color = SKILL_COLORS[skill.icon];
            const line = evidenceLine(
              evidence.get(skill.id),
              resume.skills.evidence,
            );
            return (
              <li
                key={skill.id}
                style={color ? ({ '--c': color } as CSSProperties) : undefined}
              >
                <div className='grid aspect-video place-items-center overflow-hidden rounded-xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--c,var(--sm-ink))_28%,var(--sm-surface)),var(--sm-surface))] text-[color-mix(in_srgb,var(--c,var(--sm-ink))_80%,var(--sm-ink))]'>
                  <SkillIcon
                    icon={skill.icon}
                    name={skill.name}
                    className='size-14 text-4xl'
                  />
                </div>
                <h3 className='mt-2.5 text-base/[1.3] font-medium'>
                  {skill.name}
                </h3>
                {line && (
                  <p className='mt-0.5 text-xs/[1.4] text-sm-mute'>{line}</p>
                )}
              </li>
            );
          })}
        </ul>
      </StreamDataState>
    </section>
  );
}

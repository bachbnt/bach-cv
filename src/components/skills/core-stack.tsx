/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { DataState } from '@/components/data-state';
import { CardsSkeleton } from '@/components/cards-skeleton';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { evidenceLine } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from 'cn';

/** The skills marked `highlight`, in rank order, as cards with where each was used. */
export function CoreStack({ className }: { className?: string }) {
  const copy = useCopy(resumeCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const core = skills.filter((skill) => skill.listed && skill.highlight);

  return (
    <DataState
      query={{ isPending, isError, refetch }}
      count={core.length}
      empty='coreStack'
      subject='coreStack'
      level={3}
      className={className}
      skeleton={<CardsSkeleton count={4} min={190} height={150} gap={16} />}
    >
      <div
        className={cn(
          'grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-4',
          className,
        )}
      >
        {core.map((skill) => {
          const color = SKILL_COLORS[skill.icon];
          const line = evidenceLine(
            evidence.get(skill.id),
            copy.skills.evidence,
          );
          return (
            <article
              key={skill.id}
              style={color ? ({ '--c': color } as CSSProperties) : undefined}
              className='glow lift flex flex-col gap-3.5 overflow-hidden rounded-2xl border bg-card px-[18px] pt-5 pb-[18px]'
            >
              <span
                aria-hidden='true'
                className='absolute inset-x-0 top-0 h-[3px] bg-[var(--c,var(--page))]'
              />
              <span className='flex size-11 flex-none items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--c,var(--foreground))_12%,var(--card))] text-[color-mix(in_srgb,var(--c,var(--foreground))_70%,var(--foreground))]'>
                <SkillIcon
                  icon={skill.icon}
                  name={skill.name}
                  className='size-6 font-heading text-base'
                />
              </span>
              <div>
                <h3 className='text-[19px] leading-[1.15] tracking-[-0.01em]'>
                  {skill.name}
                </h3>
                {line && (
                  <p className='mt-0.5 text-[13.5px] leading-[1.4] text-muted-foreground'>
                    {line}
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </DataState>
  );
}

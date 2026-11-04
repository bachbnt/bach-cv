/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
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
  const { skills, evidence, isPending } = useSkills();
  const core = skills.filter((skill) => skill.listed && skill.highlight);

  if (isPending) return <p className='text-muted-foreground'>{copy.loading}</p>;
  if (!core.length) return null;

  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-4',
        className,
      )}
    >
      {core.map((skill) => {
        const color = SKILL_COLORS[skill.icon];
        const line = evidenceLine(evidence.get(skill.id), copy.skills.evidence);
        return (
          <article
            key={skill.id}
            style={color ? ({ '--c': color } as CSSProperties) : undefined}
            className='relative flex flex-col gap-3.5 overflow-hidden rounded-2xl border bg-white px-[18px] pt-5 pb-[18px] before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[var(--c,var(--page))] before:content-[""] motion-safe:transition-[transform,box-shadow] motion-safe:duration-300 motion-safe:hover:-translate-y-[3px] hover:shadow-[0_14px_30px_rgba(27,31,39,.1)] active:shadow-[0_14px_30px_rgba(27,31,39,.1)]'
          >
            <span className='flex size-11 flex-none items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--c,#1b1f27)_12%,#fff)] text-[color-mix(in_srgb,var(--c,#1b1f27)_82%,#000)]'>
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
  );
}

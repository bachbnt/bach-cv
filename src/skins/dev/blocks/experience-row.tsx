/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc, Skill } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { shortHash } from '@/skins/dev/blocks/short-hash';
import { DevKeyBox } from '@/skins/dev/blocks/key-box';
import { DevLivePill } from '@/skins/dev/blocks/live-pill';
import { DevResponsibilities } from '@/skins/dev/blocks/responsibilities';
import { DevSkillChipList } from '@/skins/dev/blocks/skill-chip-list';
import { DevKind } from '@/skins/dev/ui/dev-kind';

/**
 * One role as a commit of the Source Control graph: a node, the period, the company with the Current pill, the role, the summary,
 * the key project, the technologies, the responsibilities (open for the current role) and the company logo. The hash is a
 * decoration made from the id of the role.
 */
export function DevExperienceRow({
  job,
  skills,
  index,
  open,
}: {
  job: Doc<'experience'>;
  skills: Map<string, Skill>;
  index: number;
  open: boolean;
}) {
  const { experience: copy } = useCopy(resumeCopy);
  const { lang } = useLang();
  const current = !job.endMonth;
  const intro = job.summary || job.tagline;
  const keyProjects = job.projects
    .filter((p) => p.highlight !== null)
    .sort((a, b) => (a.highlight ?? 0) - (b.highlight ?? 0));

  return (
    <article
      data-slot='dev-job'
      data-current={current ? '' : undefined}
      className='group relative grid grid-cols-[22px_1fr_minmax(0,230px)] gap-x-[18px] gap-y-1.5 border-b border-line px-[22px] pt-[22px] pb-5 before:absolute before:top-3.5 before:bottom-3.5 before:left-0 before:w-[3px] before:origin-center before:rounded-[0_3px_3px_0] before:bg-signal before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.2,0.7,0.2,1)] before:content-[""] before:[transform:scaleY(0)] last:border-b-0 hover:bg-hov hover:before:[transform:scaleY(1)] max-[900px]:grid-cols-[22px_1fr]'
      style={{ '--i': index } as CSSProperties}
      data-reveal
    >
      <i
        className={cn(
          'row-start-1 mt-2 size-3 rounded-full border-2 border-signal bg-chrome transition-[box-shadow,transform] duration-300 ease-[ease] group-hover:shadow-[0_0_0_5px_color-mix(in_srgb,var(--dv-accent)_22%,transparent)] group-hover:[transform:scale(1.15)]',
          current && 'bg-signal',
        )}
        aria-hidden='true'
        data-testid='timeline-dot'
      />
      <time className='absolute top-[22px] right-[22px] font-code text-[12.5px] leading-[normal] font-normal text-dim max-[900px]:static max-[900px]:col-start-2 max-[900px]:-order-1'>
        {formatPeriod(job.startMonth, job.endMonth, lang)}
      </time>
      <div className='col-start-2 min-w-0'>
        <div
          className='font-code text-[12.5px] leading-[normal] font-normal'
          aria-hidden='true'
        >
          <span className='text-gold transition-[filter] duration-[250ms] ease-[ease] group-hover:brightness-125'>
            {shortHash(job.id)}
          </span>
          {current && <span className='ml-2 text-signal'>(HEAD → main)</span>}
        </div>
        <h3 className='mt-1 pr-[150px] text-[22px] transition-[color] duration-[250ms] ease-[ease] group-hover:text-signal max-[900px]:pr-0'>
          {job.company}
          {current && <DevLivePill>{copy.current}</DevLivePill>}
        </h3>
        <p className='mt-0.5 mb-2 font-code text-[14.5px] leading-[normal] font-semibold text-sky'>
          {job.role}
          {job.team && (
            <span className='font-normal text-mute'>{` · ${job.team}`}</span>
          )}
        </p>
        {intro && <p className='mb-2 max-w-[640px] text-mute'>{intro}</p>}
        {keyProjects.map((project) => (
          <DevKeyBox key={project.name}>
            <DevKind>{copy.keyProject}</DevKind>
            <h4 className='text-[15px]'>{project.name}</h4>
            {project.description && (
              <p className='mt-1 text-[14.5px] text-mute'>
                {project.description}
              </p>
            )}
          </DevKeyBox>
        ))}
        <DevSkillChipList ids={job.technologies} skills={skills} />
        {job.bullets.length > 0 && (
          <DevResponsibilities
            bullets={job.bullets}
            defaultOpen={open}
            show={copy.show}
            hide={copy.hide}
          />
        )}
      </div>
      {job.logo && (
        <div className='relative col-start-3 row-start-1 mt-7 aspect-[3/2] self-start overflow-hidden rounded-[8px] border border-line-2 bg-chrome-2 max-[900px]:col-start-2 max-[900px]:row-auto max-[900px]:mt-1.5 max-[900px]:max-w-[260px]'>
          <Image
            src={job.logo}
            alt={job.company}
            fill
            sizes='230px'
            className='object-cover transition-[transform,filter] duration-500 ease-[ease] [filter:saturate(0.85)] group-hover:[filter:none] group-hover:[transform:scale(1.05)]'
          />
        </div>
      )}
    </article>
  );
}

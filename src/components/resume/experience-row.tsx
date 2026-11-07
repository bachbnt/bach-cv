/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { CurrentBadge } from '@/components/current-badge';
import { Responsibilities } from '@/components/resume/responsibilities';
import { SkillTags } from '@/components/resume/skill-tags';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import type { Doc, Skill } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { highlighted } from '@/lib/derive/highlighted';
import { isCurrent } from '@/lib/derive/current-job';
import type { CSSProperties } from 'react';
import { cn } from 'cn';

/** The position of a part of the row in its entrance: the parts arrive one after another (see `data-part` in globals.css). */
const part = (n: number) => ({ '--p': n }) as CSSProperties;

/**
 * One role: period, company with the Current pill, role, summary, the key project, technologies,
 * the responsibilities (open for the first row), and the company logo.
 * On wide screens a timeline runs down the left: a line that draws itself as the row appears and a dot for each role.
 */
export function ExperienceRow({
  job,
  skills,
  open,
}: {
  job: Doc<'experience'>;
  skills: Map<string, Skill>;
  open: boolean;
}) {
  const { experience: copy } = useCopy(resumeCopy);
  const { lang } = useLang();
  const intro = job.summary || job.tagline;
  const keyProjects = highlighted(job.projects);

  const current = isCurrent(job);
  return (
    <article className='group/row relative flex flex-wrap gap-x-12 gap-y-3 border-t px-3 py-7 transition-colors hover:bg-card active:bg-card min-[721px]:px-6 min-[721px]:py-10'>
      {/* timeline: only where the date and the role share a line */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-y-0 left-[198px] hidden w-0 min-[920px]:block'
      >
        <span className='absolute -top-px bottom-0 left-0 w-px origin-top bg-border transition-[scale] delay-150 duration-700 ease-out group-first/row:top-[55px] group-last/row:bottom-[calc(100%-55px)] [[data-reveal]:not(.in)_&]:scale-y-0' />
        <span
          data-testid='timeline-dot'
          className={cn(
            'absolute top-[49px] -left-1.5 size-3 rounded-full border-2 border-page transition-[scale] delay-300 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] [[data-reveal]:not(.in)_&]:scale-0',
            current ? 'bg-page' : 'bg-background',
          )}
        >
          {current && <span className='timeline-ring' />}
        </span>
      </div>
      <p
        data-part
        style={part(0)}
        className='flex-[0_0_150px] pt-2 text-[15px] leading-normal text-muted-foreground'
      >
        {formatPeriod(job.startMonth, job.endMonth, lang)}
      </p>
      <div className='min-w-0 flex-[1_1_480px]'>
        <h3 data-part style={part(1)} className='text-[28px] leading-[1.1]'>
          {job.company}
          {current && <CurrentBadge>{copy.current}</CurrentBadge>}
        </h3>
        <p data-part style={part(2)} className='mt-1.5 text-lg font-semibold'>
          {job.role}
          {job.team && (
            <span className='font-normal text-muted-foreground'>
              {' · '}
              {job.team}
            </span>
          )}
        </p>
        {intro && (
          <p
            data-part
            style={part(3)}
            className='mt-3 max-w-[640px] text-[17px] leading-[1.55] text-body'
          >
            {intro}
          </p>
        )}
        {keyProjects.map((project) => (
          <div
            key={project.name}
            data-part
            style={part(4)}
            className='glow mt-5 rounded-xl border bg-card px-[18px] py-4'
          >
            <span className='mb-2 inline-flex items-center rounded-full bg-page-tint px-2.5 py-[3px] text-[13px] font-semibold whitespace-nowrap text-page'>
              {copy.keyProject}
            </span>
            <h4 className='font-sans text-base font-semibold'>
              {project.name}
            </h4>
            {project.description && (
              <p className='mt-1 text-[15px] leading-[1.55] text-muted-foreground'>
                {project.description}
              </p>
            )}
          </div>
        ))}
        <div data-part style={part(5)}>
          <SkillTags ids={job.technologies} skills={skills} className='mt-4' />
        </div>
        {job.bullets.length > 0 && (
          <div data-part style={part(6)}>
            <Responsibilities
              bullets={job.bullets}
              defaultOpen={open}
              show={copy.show}
              hide={copy.hide}
            />
          </div>
        )}
      </div>
      {job.logo && (
        <div
          data-part
          style={part(2)}
          className='relative mt-2 h-[200px] max-w-[280px] flex-[1_1_220px] self-start overflow-hidden rounded-xl bg-border'
        >
          <Image
            src={job.logo}
            alt={job.company}
            fill
            sizes='280px'
            className='object-cover saturate-[.85] transition-[scale,filter] duration-500 ease-out group-hover/row:scale-105 group-hover/row:saturate-100 motion-reduce:transition-none motion-reduce:group-hover/row:scale-100'
          />
        </div>
      )}
    </article>
  );
}

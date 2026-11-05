/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { SkillTags } from '@/components/resume/skill-tags';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import type { Doc, Skill } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';

/**
 * One role: period, company with the Current pill, role, summary, the key project, technologies,
 * the responsibilities (open for the first row), and the company logo.
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
  const keyProjects = job.projects
    .filter((p) => p.highlight !== null)
    .sort((a, b) => (a.highlight ?? 0) - (b.highlight ?? 0));

  return (
    <article className='flex flex-wrap gap-x-12 gap-y-3 border-t px-3 py-7 transition-colors hover:bg-card active:bg-card min-[721px]:px-6 min-[721px]:py-10'>
      <p className='flex-[0_0_150px] pt-2 text-[15px] leading-normal text-muted-foreground'>
        {formatPeriod(job.startMonth, job.endMonth, lang)}
      </p>
      <div className='min-w-0 flex-[1_1_480px]'>
        <h3 className='text-[28px] leading-[1.1]'>
          {job.company}
          {!job.endMonth && (
            <span className='relative -top-0.5 ml-2.5 inline-flex items-center rounded-full bg-night px-2.5 py-[3px] align-middle text-xs font-semibold text-white'>
              {copy.current}
            </span>
          )}
        </h3>
        <p className='mt-1.5 text-lg font-semibold'>
          {job.role}
          {job.team && (
            <span className='font-normal text-muted-foreground'>
              {' · '}
              {job.team}
            </span>
          )}
        </p>
        {intro && (
          <p className='mt-3 max-w-[640px] text-[17px] leading-[1.55] text-body'>
            {intro}
          </p>
        )}
        {keyProjects.map((project) => (
          <div
            key={project.name}
            className='mt-5 rounded-xl border bg-card px-[18px] py-4'
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
        <SkillTags ids={job.technologies} skills={skills} className='mt-4' />
        {job.bullets.length > 0 && (
          <details open={open} className='group mt-5'>
            <summary className='flex min-h-11 cursor-pointer list-none items-center text-[15px] font-semibold underline underline-offset-4 [&::-webkit-details-marker]:hidden'>
              <span className='group-open:hidden'>{copy.show}</span>
              <span className='hidden group-open:inline'>{copy.hide}</span>
            </summary>
            <ul className='mt-4 flex list-disc flex-col gap-3 pl-5 text-base leading-[1.6] text-body'>
              {job.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
      {job.logo && (
        <Image
          src={job.logo}
          alt={job.company}
          width={280}
          height={200}
          className='mt-2 h-[200px] max-w-[280px] flex-[1_1_220px] self-start rounded-xl bg-border object-cover'
        />
      )}
    </article>
  );
}

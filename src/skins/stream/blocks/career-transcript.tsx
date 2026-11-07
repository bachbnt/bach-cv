/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { useId } from 'react';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import {
  introOf,
  keyProjectsOf,
  technologiesOf,
} from '@/skins/stream/blocks/career-job';
import { LiveBadge } from '@/skins/stream/ui/live-badge';

/**
 * One role of the transcript: a rail with the years, then the logo, the company with the red badge when it is still going, the role
 * and team, the period, the summary, the key projects, the technologies as hashtags and the responsibilities as numbered lines that
 * open and shut. Shut, they are `inert`, so only the button can be reached.
 */
export function CareerTranscriptItem({
  job,
  skills,
  open,
  onToggle,
}: {
  job: Doc<'experience'>;
  skills: ReadonlyMap<string, { name: string }>;
  open: boolean;
  onToggle: () => void;
}) {
  const { experience: copy } = useCopy(resumeCopy);
  const { lang } = useLang();
  const listId = useId();
  const intro = introOf(job);
  const current = !job.endMonth;
  const technologies = technologiesOf(job.technologies, skills);

  return (
    <article
      id={`chapter-${job.id}`}
      aria-labelledby={`chapter-${job.id}-h`}
      className='relative grid scroll-mt-20 gap-x-6 py-5 min-[701px]:grid-cols-[88px_minmax(0,1fr)]'
    >
      <div
        aria-hidden='true'
        className='mb-1 flex items-baseline gap-2 text-sm tabular-nums min-[701px]:mb-0 min-[701px]:flex-col min-[701px]:gap-0'
      >
        <span
          className={cn(
            'text-xl/[1.2] font-bold',
            current ? 'text-sm-red-ink' : 'text-sm-ink',
          )}
        >
          {job.startMonth.slice(0, 4)}
        </span>
        {job.endMonth?.slice(0, 4) !== job.startMonth.slice(0, 4) && (
          <span className='text-sm-mute'>
            {job.endMonth ? job.endMonth.slice(0, 4) : '→'}
          </span>
        )}
      </div>
      <div className='min-w-0'>
        <div className='flex items-start gap-3'>
          {job.logo && (
            <div className='relative aspect-video w-24 flex-none overflow-hidden rounded-lg bg-sm-hover min-[701px]:w-32'>
              <Image
                src={job.logo}
                alt={job.company}
                fill
                sizes='128px'
                className='object-cover'
              />
            </div>
          )}
          <div className='min-w-0'>
            <h3
              id={`chapter-${job.id}-h`}
              tabIndex={-1}
              className='flex flex-wrap items-center gap-2 text-lg/[1.3] font-bold outline-none'
            >
              {job.company}
              {current && <LiveBadge>{copy.current}</LiveBadge>}
            </h3>
            <p className='mt-0.5 font-medium'>
              {job.role}
              {job.team && (
                <span className='font-normal text-sm-mute'>
                  {' · '}
                  {job.team}
                </span>
              )}
            </p>
            <p className='mt-0.5 text-[13px] text-sm-mute'>
              {formatPeriod(job.startMonth, job.endMonth, lang)}
            </p>
          </div>
        </div>
        {intro && <p className='mt-3 max-w-[680px] text-sm/[1.55]'>{intro}</p>}
        {keyProjectsOf(job).map((project) => (
          <div
            key={project.name}
            className='mt-3 max-w-[680px] rounded-lg border-l-2 border-sm-blue bg-sm-surface px-3 py-2.5'
          >
            <p className='text-xs font-medium text-sm-blue'>
              {copy.keyProject}
            </p>
            <h4 className='text-sm font-medium'>{project.name}</h4>
            {project.description && (
              <p className='mt-0.5 text-[13px]/[1.5] text-sm-mute'>
                {project.description}
              </p>
            )}
          </div>
        ))}
        {technologies.length > 0 && (
          <ul className='m-0 mt-3 flex list-none flex-wrap gap-x-3 gap-y-1 p-0'>
            {technologies.map((skill) => (
              <li
                key={skill.id}
                className='text-[13px] font-medium text-sm-blue'
              >
                <span aria-hidden='true'>#</span>
                {skill.name}
              </li>
            ))}
          </ul>
        )}
        {job.bullets.length > 0 && (
          <div className='mt-2'>
            <button
              type='button'
              aria-expanded={open}
              aria-controls={listId}
              onClick={onToggle}
              className='inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full bg-sm-chip px-3 text-sm font-medium transition-colors hover:bg-sm-hover2 pointer-coarse:min-h-11'
            >
              {open ? copy.hide : copy.show}
              <ChevronDown
                aria-hidden='true'
                className={cn(
                  'size-4 transition-transform',
                  open && 'rotate-180',
                )}
              />
            </button>
            <div
              id={listId}
              data-open={open}
              inert={!open}
              className='grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out data-[open=true]:grid-rows-[1fr]'
            >
              <div className='overflow-hidden'>
                <ol className='m-0 flex list-none flex-col gap-2 p-0 pt-3'>
                  {job.bullets.map((bullet, index) => (
                    <li
                      key={bullet}
                      className='flex max-w-[720px] gap-3 text-sm/[1.55]'
                    >
                      <span
                        aria-hidden='true'
                        className='w-6 flex-none pt-px text-xs font-medium text-sm-blue tabular-nums'
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className='min-w-0'>{bullet}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

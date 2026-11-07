/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { introOf, keyProjectsOf } from '@/skins/stream/blocks/career-job';
import { LiveBadge } from '@/skins/stream/ui/live-badge';

/** The parts of a scene arrive one after another when it becomes the one that plays (`data-active` on the scene). */
const RISE =
  'group-data-[active=true]/scene:animate-[sm-rise_0.6s_cubic-bezier(0.2,0.7,0.2,1)_both]';
const after = (delay: number) => ({ animationDelay: `${delay}ms` });

/**
 * One role as a scene of the video: the cover (the company logo) with the year it began, the red badge if it is still going, the
 * company, the role and team, the period, the summary (or tagline) and the key projects. Scenes of a player lie one over another in
 * the same cell, so the frame is as tall as the tallest and never jumps; the ones that do not play are hidden and `inert`.
 */
export function CareerScene({
  job,
  active,
}: {
  job: Doc<'experience'>;
  active: boolean;
}) {
  const { lang } = useLang();
  const { experience } = useCopy(resumeCopy);
  const intro = introOf(job);
  const projects = keyProjectsOf(job);
  const current = !job.endMonth;

  return (
    <div
      data-active={active}
      aria-hidden={!active}
      inert={!active}
      className={cn(
        'group/scene relative flex flex-col gap-4 overflow-hidden px-4 pt-5 pb-3 transition-opacity duration-500 min-[701px]:flex-row min-[701px]:items-center min-[701px]:gap-8 min-[701px]:px-9 min-[701px]:pt-6',
        active ? 'opacity-100' : 'invisible opacity-0',
      )}
    >
      <span
        aria-hidden='true'
        className='pointer-events-none absolute -top-3 right-3 text-[clamp(72px,13vw,168px)]/none font-black tracking-tighter text-white/[0.06] select-none'
      >
        {job.startMonth.slice(0, 4)}
      </span>
      <div
        style={after(0)}
        className={cn(
          RISE,
          'relative h-28 flex-none overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15 min-[701px]:h-auto min-[701px]:w-[32%] min-[701px]:max-w-[260px] min-[701px]:aspect-[4/3]',
        )}
      >
        {job.logo ? (
          <Image
            src={job.logo}
            alt={job.company}
            fill
            sizes='(min-width: 701px) 260px, 100vw'
            className='object-cover'
          />
        ) : (
          <span
            aria-hidden='true'
            className='grid size-full place-items-center text-4xl font-bold'
          >
            {job.shortName || job.company.slice(0, 3)}
          </span>
        )}
      </div>
      <div className='relative min-w-0 flex-1'>
        {current && (
          <LiveBadge className='mb-2'>{experience.current}</LiveBadge>
        )}
        <p
          style={after(80)}
          className={cn(
            RISE,
            'text-2xl/[1.15] font-bold tracking-tight min-[701px]:text-[32px]/[1.1]',
          )}
        >
          {job.company}
        </p>
        <p
          style={after(140)}
          className={cn(RISE, 'mt-1 text-base/[1.35] font-medium')}
        >
          {job.role}
          {job.team && (
            <span className='font-normal text-white/70'>
              {' · '}
              {job.team}
            </span>
          )}
        </p>
        <p
          style={after(200)}
          className={cn(RISE, 'mt-0.5 text-[13px] text-white/70')}
        >
          {formatPeriod(job.startMonth, job.endMonth, lang)}
        </p>
        {intro && (
          <p
            style={after(260)}
            className={cn(
              RISE,
              'mt-3 max-w-[560px] text-sm/[1.5] text-white/90',
            )}
          >
            {intro}
          </p>
        )}
        {projects.map((project) => (
          <div
            key={project.name}
            style={after(320)}
            className={cn(
              RISE,
              'mt-3 max-w-[560px] rounded-lg bg-white/10 px-3 py-2',
            )}
          >
            <p className='text-[11px] font-bold tracking-wide text-white/60 uppercase'>
              {experience.keyProject}
            </p>
            <p className='text-sm font-medium'>{project.name}</p>
            {project.description && (
              <p className='mt-0.5 text-[13px]/[1.45] text-white/75'>
                {project.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

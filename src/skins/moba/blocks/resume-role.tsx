/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Clock, Gem } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { mobaResumeCopy } from '@/content/copy/moba-resume';
import { resumeCopy } from '@/content/copy/resume';
import { fill } from '@/lib/chat/fill';
import type { Doc, Skill } from '@/lib/content/schema';
import { isCurrent } from '@/lib/derive/current-job';
import { lengthLabel } from '@/lib/derive/duration-label';
import { highlighted } from '@/lib/derive/highlighted';
import { jobBadge } from '@/lib/derive/job-badge';
import { jobLength } from '@/lib/derive/career-months';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { ResumeBullets } from '@/skins/moba/blocks/resume-bullets';
import { ResumeTags } from '@/skins/moba/blocks/resume-tags';
import { useGame } from '@/skins/moba/shell/game-context';
import { useReducedMotion } from '@/skins/moba/shell/use-reduced-motion';
import { MbCard } from '@/skins/moba/ui/mb-card';
import { MbChip } from '@/skins/moba/ui/mb-chip';

/** How long the frame of a role stays lit after the visitor came to it from its tower of the map, in ms. */
const FLASH_MS = 1600;

/** The place of a role in the career, as `careerStops` gives it. */
export interface Tower {
  n: number;
  total: number;
  nexus: boolean;
}

/**
 * One role as a tower of the lane: the badge of its tower on the lane line, and a plaque with the company, the role, the period and the
 * time held, the Current chip, the summary, the key projects, the technologies and the responsibilities. When the game's `focus` names this
 * role (the visitor clicked its tower on the map) it opens, scrolls into view and lights its frame once, then gives the focus up.
 */
export function ResumeRole({
  job,
  skills,
  tower,
  now,
  firstOpen,
}: {
  job: Doc<'experience'>;
  skills: Map<string, Skill>;
  tower: Tower | undefined;
  now: Date;
  firstOpen: boolean;
}) {
  const { experience: copy } = useCopy(resumeCopy);
  const mb = useCopy(mobaResumeCopy);
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const frame = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(firstOpen);
  const [flash, setFlash] = useState(false);
  const current = isCurrent(job);
  const intro = job.summary || job.tagline;
  const keyProjects = highlighted(job.projects);
  const held = lengthLabel(jobLength(job, now), mb.length);
  const { focus, clearFocus } = useGame();
  const mine = focus?.kind === 'job' && focus.id === job.id;
  // the visitor came from the tower of this role: open it and light its frame (once per arrival, so it is set while rendering, not in an effect)
  const [arrived, setArrived] = useState(false);
  if (mine && !arrived) {
    setArrived(true);
    setOpen(true);
    setFlash(true);
  } else if (!mine && arrived) setArrived(false);

  useEffect(() => {
    if (!mine) return;
    // the panel puts a new page at its top after this effect, so the scroll waits for the next frames; the focus is given up after it
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        frame.current?.scrollIntoView({
          block: 'start',
          behavior: reduced ? 'auto' : 'smooth',
        });
        clearFocus();
      });
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [mine, reduced, clearFocus]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(false), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flash]);

  return (
    <li
      ref={frame}
      data-job={job.id}
      data-current={current ? '' : undefined}
      className='mb-role scroll-mt-3 grid grid-cols-[44px_minmax(0,1fr)] gap-x-3 max-[719px]:grid-cols-[34px_minmax(0,1fr)] max-[719px]:gap-x-2'
    >
      <div aria-hidden='true' className='relative flex justify-center pt-4'>
        <span className={cn('mb-tower', tower?.nexus && 'mb-tower-nexus')}>
          {tower?.nexus ? <Gem className='size-[18px]' /> : (tower?.n ?? '')}
        </span>
      </div>
      <MbCard
        data-flash={flash ? '' : undefined}
        className='mb-role-card min-w-0 px-5 py-4 max-[719px]:px-3.5'
      >
        <p
          className={cn(
            'text-[10px] leading-none font-bold tracking-[0.2em] uppercase',
            tower?.nexus ? 'text-mb-red-ink' : 'text-mb-teal-ink',
          )}
        >
          {tower?.nexus
            ? mb.nexus
            : tower
              ? fill(mb.tower, { n: tower.n, total: tower.total })
              : null}
        </p>
        <div className='mt-3 flex flex-wrap items-start gap-x-4 gap-y-3'>
          {job.logo ? (
            <span className='relative h-14 w-20 flex-none overflow-hidden bg-white'>
              <Image
                src={job.logo}
                alt={job.company}
                fill
                sizes='80px'
                className='object-cover'
              />
            </span>
          ) : (
            <span
              aria-hidden='true'
              className='grid h-14 w-20 flex-none place-items-center bg-mb-teal/30 font-mb-display text-xl font-bold text-mb-ink'
            >
              {jobBadge(job)}
            </span>
          )}
          <div className='min-w-0 flex-[1_1_220px]'>
            <h3 className='flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[24px] leading-[1.1] text-mb-title max-[719px]:text-[21px]'>
              {job.company}{' '}
              {current && (
                <MbChip
                  tone='teal'
                  className='font-[family-name:var(--mb-font)]'
                >
                  <span aria-hidden='true' className='current-dot' />
                  {copy.current}
                </MbChip>
              )}
            </h3>
            <p className='mt-1.5 text-[15px] font-semibold text-mb-ink'>
              {job.role}
              {job.team && (
                <span className='font-normal text-mb-mute'>
                  {' · '}
                  {job.team}
                </span>
              )}
            </p>
            <p className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] font-semibold text-mb-mute'>
              <span>{formatPeriod(job.startMonth, job.endMonth, lang)}</span>
              <span className='inline-flex items-center gap-1.5 font-normal'>
                <Clock aria-hidden='true' className='size-3.5' />
                {fill(mb.held, { time: held })}
              </span>
            </p>
          </div>
        </div>
        {intro && (
          <p className='mt-3.5 max-w-[620px] text-[15px] leading-[1.6] text-mb-ink/90'>
            {intro}
          </p>
        )}
        {keyProjects.map((project) => (
          <div
            key={project.name}
            className='mt-4 border-l-[3px] border-mb-teal bg-mb-well/70 px-3.5 py-3'
          >
            <MbChip tone='gold'>{copy.keyProject}</MbChip>
            <h4 className='mt-2 text-[17px] leading-tight text-mb-title'>
              {project.name}
            </h4>
            {project.description && (
              <p className='mt-1 text-[14px] leading-[1.55] text-mb-mute'>
                {project.description}
              </p>
            )}
          </div>
        ))}
        <ResumeTags ids={job.technologies} skills={skills} className='mt-4' />
        {job.bullets.length > 0 && (
          <ResumeBullets
            bullets={job.bullets}
            open={open}
            onToggle={() => setOpen((value) => !value)}
            show={copy.show}
            hide={copy.hide}
          />
        )}
      </MbCard>
    </li>
  );
}

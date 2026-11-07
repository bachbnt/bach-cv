/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo, useState } from 'react';
import { DownloadCv } from '@/components/download-cv';
import { useSkills } from '@/components/skills/use-skills';
import { careerCopy } from '@/content/copy/stream-career';
import { resumeCopy } from '@/content/copy/resume';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import {
  CareerBar,
  type CareerBarItem,
} from '@/skins/stream/blocks/career-bar';
import {
  chaptersOf,
  inOrder,
  yearRange,
} from '@/skins/stream/blocks/career-chapters';
import { fill } from '@/skins/stream/blocks/career-job';
import { CareerTranscriptItem } from '@/skins/stream/blocks/career-transcript';
import { useReducedMotion } from '@/skins/stream/blocks/career-use-reduced-motion';
import { CV_PILL } from '@/skins/stream/ui/cv-pill';
import { LiveBadge } from '@/skins/stream/ui/live-badge';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamHeading } from '@/skins/stream/ui/stream-heading';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

const jump =
  'inline-flex h-8 items-center rounded-lg bg-sm-chip px-3 text-sm font-medium transition-colors hover:bg-sm-hover2 pointer-coarse:h-11';

/**
 * The top of Resume, the full replay: the title, the intro and the Download CV button, the chapters as one big timeline (roles as
 * blocks as wide as they lasted, the current one red), and the roles as a transcript, the newest first. A chapter of the timeline
 * scrolls to its role, opens its responsibilities and moves the focus to it. The first role starts open, as in Standard.
 */
export function CareerResume() {
  const copy = useCopy(resumeCopy);
  const career = useCopy(careerCopy);
  const { lang } = useLang();
  const reducedMotion = useReducedMotion();
  const query = useContentQuery('experience');
  const { byId } = useSkills();
  const [now] = useState(() => new Date());
  const data = query.data;
  const jobs = useMemo(() => inOrder(data ?? []), [data]);
  const newestFirst = useMemo(() => [...jobs].reverse(), [jobs]);
  const chapters = useMemo(() => chaptersOf(jobs, now), [jobs, now]);
  const { from, to } = yearRange(jobs, now);
  // null: nothing has been touched yet, and the newest role is the one that starts open
  const [opened, setOpened] = useState<Set<string> | null>(null);
  const [last, setLast] = useState<string | null>(null);
  const firstId = newestFirst[0]?.id;
  const openNow = (prev: Set<string> | null) =>
    new Set(prev ?? (firstId ? [firstId] : []));
  const isOpen = (id: string) => openNow(opened).has(id);

  const items: CareerBarItem[] = jobs.map((job, index) => {
    const years = formatPeriod(job.startMonth, job.endMonth, lang);
    return {
      id: job.id,
      label: fill(career.chapters.item, {
        company: job.company,
        role: job.role,
        period: years,
      }),
      company: job.company,
      role: job.role,
      years:
        chapters[index].startYear === chapters[index].endYear
          ? String(chapters[index].startYear)
          : `${chapters[index].startYear}–${chapters[index].endYear}`,
    };
  });
  const current = jobs.find((job) => !job.endMonth);
  const activeIndex = Math.max(
    0,
    jobs.findIndex((job) => job.id === (last ?? current?.id ?? firstId)),
  );

  const toggle = (id: string) => {
    setLast(id);
    setOpened((prev) => {
      const next = openNow(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  };

  const select = (index: number) => {
    const id = jobs[index].id;
    setLast(id);
    setOpened((prev) => openNow(prev).add(id));
    const article = document.getElementById(`chapter-${id}`);
    article?.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
    article?.querySelector<HTMLElement>('h3')?.focus({ preventScroll: true });
  };

  return (
    <>
      <div className='mb-6 px-3 min-[701px]:px-0'>
        <h1 className='text-2xl/[1.2] font-bold'>{copy.title}</h1>
        <p className='mt-1.5 max-w-[640px] text-sm/[1.5] text-sm-mute'>
          {copy.intro}
        </p>
        <div className='mt-3 flex flex-wrap items-center gap-3'>
          <DownloadCv label={copy.downloadCv} className={CV_PILL} />
          <div
            role='group'
            aria-label={copy.title}
            className='flex flex-wrap gap-3'
          >
            <a href='#experience' className={jump}>
              {copy.experience.title}
            </a>
            <a href='#skills' className={jump}>
              {copy.skills.title}
            </a>
            <a href='#education' className={jump}>
              {copy.education.title}
            </a>
          </div>
        </div>
        {query.isPending ? (
          <StreamSkeleton className='mt-5 h-[88px]' />
        ) : (
          jobs.length > 0 && (
            <div className='mt-5'>
              <div className='mb-2 flex flex-wrap items-center justify-between gap-2 text-[13px] text-sm-mute'>
                <span className='tabular-nums'>
                  {from === to ? from : `${from} – ${to}`}
                </span>
                {current && <LiveBadge>{copy.experience.current}</LiveBadge>}
              </div>
              <CareerBar
                variant='timeline'
                label={career.chapters.label}
                items={items}
                chapters={chapters}
                active={activeIndex}
                current={copy.experience.current}
                onSelect={select}
              />
            </div>
          )
        )}
      </div>
      <section
        id='experience'
        aria-labelledby='experience-h'
        className='scroll-mt-20 px-3 min-[701px]:px-0'
      >
        <StreamHeading id='experience-h' className='mb-0'>
          {copy.experience.title}
        </StreamHeading>
        <StreamDataState
          query={query}
          count={jobs.length}
          empty='experience'
          subject='experience'
          level={3}
          className='mt-4'
          skeleton={
            <div className='flex flex-col gap-5'>
              {Array.from({ length: 3 }, (_, i) => (
                <StreamSkeleton key={i} className='h-40' />
              ))}
            </div>
          }
        >
          <div className='divide-y divide-sm-line'>
            {newestFirst.map((job) => (
              <CareerTranscriptItem
                key={job.id}
                job={job}
                skills={byId}
                open={isOpen(job.id)}
                onToggle={() => toggle(job.id)}
              />
            ))}
          </div>
        </StreamDataState>
      </section>
    </>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { DataCorporateActions } from '@/skins/trade/blocks/data-corporate-actions';
import { DataMediaHost } from '@/skins/trade/blocks/data-media';
import { DataEvents } from '@/skins/trade/blocks/data-events';
import { DataFinancials } from '@/skins/trade/blocks/data-financials';
import { DataResumeSkeleton } from '@/skins/trade/blocks/data-resume-skeleton';
import { DataRoleNotes } from '@/skins/trade/blocks/data-role-notes';
import { DataSkills } from '@/skins/trade/blocks/data-skills';
import { useReveal } from '@/skins/trade/blocks/data-use-reveal';
import { DownloadCvButton } from '@/skins/trade/shell/download-cv-button';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvPanel } from '@/skins/trade/ui/tv-panel';
import { TV_PILL } from '@/skins/trade/ui/tv-toggle-chip';

const HEADING = 'px-3.5 pt-5 pb-2 text-[13px] font-bold';

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className='scroll-mt-4'>
      <h2 id={`${id}-h`} className={HEADING}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Resume as a set of statements: the career by year, the events, the notes of each role, education and skills. */
export function DataResumeView() {
  const copy = useCopy(resumeCopy);
  const { resume } = useCopy(tradeDataCopy);
  const query = useContentQuery('experience');
  const loaded = !query.isPending;
  const jobs = query.data ?? [];

  // the link "See all skills" of About ends in #skills: the jobs above it change its place when they arrive, so scroll once they have
  useEffect(() => {
    if (loaded && window.location.hash === '#skills')
      document.getElementById('skills')?.scrollIntoView();
  }, [loaded]);

  const reveal = useReveal(jobs);
  const jump = [
    ['tv-experience', resume.jump.experience],
    ['tv-events', resume.jump.events],
    ['tv-education', resume.jump.education],
    ['skills', resume.jump.skills],
  ];

  return (
    <TvPanel
      title={copy.title}
      intro={copy.intro}
      actions={<DownloadCvButton label={copy.downloadCv} />}
    >
      <nav
        aria-label={resume.sections}
        className='flex flex-wrap gap-1.5 px-3.5 pt-3'
      >
        {jump.map(([id, label]) => (
          <a key={id} href={`#${id}`} data-slot='tv-link' className={TV_PILL}>
            {label}
          </a>
        ))}
      </nav>
      <DataMediaHost>
        <TvDataState
          query={query}
          count={jobs.length}
          empty='experience'
          subject='experience'
          level={2}
          skeleton={<DataResumeSkeleton />}
          className='m-3.5'
        >
          <Jobs jobs={jobs} reveal={reveal} />
        </TvDataState>
        <Section id='tv-education' title={copy.education.title}>
          <DataCorporateActions />
        </Section>
        <DataSkills jobs={jobs} reveal={reveal.reveal} />
      </DataMediaHost>
    </TvPanel>
  );
}

/** The blocks that are made of the jobs: the statement, the notes and the events. */
function Jobs({
  jobs,
  reveal,
}: {
  jobs: Doc<'experience'>[];
  reveal: ReturnType<typeof useReveal>;
}) {
  const { experience: copy } = useCopy(resumeCopy);
  const { resume } = useCopy(tradeDataCopy);
  const { byId } = useSkills();
  const [now] = useState(() => new Date());
  const { open, activeId, toggle } = reveal;

  return (
    <>
      <Section id='tv-experience' title={copy.title}>
        <DataFinancials
          jobs={jobs}
          now={now}
          activeId={activeId}
          onOpen={reveal.reveal}
        />
        <h3 className={HEADING}>
          {resume.notes.title}
          <span className='ml-2 text-xs font-normal text-tv-mute'>
            {resume.notes.lead}
          </span>
        </h3>
        <DataRoleNotes
          jobs={jobs}
          skills={byId}
          open={open}
          activeId={activeId}
          onToggle={toggle}
        />
      </Section>
      <Section id='tv-events' title={resume.events.title}>
        <p className='px-3.5 pb-2 text-xs text-tv-mute'>{resume.events.lead}</p>
        <DataEvents jobs={jobs} onOpen={reveal.reveal} />
      </Section>
    </>
  );
}

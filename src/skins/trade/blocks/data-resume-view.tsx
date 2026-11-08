/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { resumeCopy } from '@/content/copy/resume';
import { tradeDataCopy } from '@/content/copy/trade-data';
import { useCopy } from '@/lib/i18n/copy';
import { useYearsText } from '@/lib/query/use-career-years';
import { useContentQuery } from '@/lib/query/use-content';
import { DataCorporateActions } from '@/skins/trade/blocks/data-corporate-actions';
import { DataMediaHost } from '@/skins/trade/blocks/data-media';
import { DataResumeSkeleton } from '@/skins/trade/blocks/data-resume-skeleton';
import { DataSkills } from '@/skins/trade/blocks/data-skills';
import { useReveal } from '@/skins/trade/blocks/data-use-reveal';
import { DownloadCvButton } from '@/skins/trade/shell/download-cv-button';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvPanel } from '@/skins/trade/ui/tv-panel';
import { TV_PILL } from '@/skins/trade/ui/tv-toggle-chip';
import { Section } from '@/skins/trade/blocks/data-resume-section';
import { Jobs } from '@/skins/trade/blocks/data-resume-jobs';

/** Resume as a set of statements: the career by year, the events, the notes of each role, education and skills. */
export function DataResumeView() {
  const copy = useCopy(resumeCopy);
  const intro = useYearsText(copy.intro, copy.introUndated, { spelled: true });
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
    ['tv-experience', copy.experience.title],
    ['tv-events', resume.events.title],
    ['tv-education', copy.education.title],
    ['skills', copy.skills.title],
  ];

  return (
    <TvPanel
      title={copy.title}
      intro={intro}
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

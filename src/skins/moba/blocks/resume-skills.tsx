/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { mobaResumeCopy } from '@/content/copy/moba-resume';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { ResumeCoreStack } from '@/skins/moba/blocks/resume-core-stack';
import { ResumeSkillGroups } from '@/skins/moba/blocks/resume-skill-groups';
import { useReducedMotion } from '@/skins/moba/shell/use-reduced-motion';
import { MbSection } from '@/skins/moba/ui/mb-section';

/** The title of a part of the Skills section: its name and the line that says what it is. */
function Part({
  title,
  lead,
  kicker,
}: {
  title: string;
  lead: string;
  kicker: string;
}) {
  return (
    <div className='mt-6 mb-3'>
      <p className='mb-1.5 text-[10px] leading-none font-bold tracking-[0.22em] text-mb-teal-ink uppercase'>
        {kicker}
      </p>
      <h3 className='text-[22px] leading-[1.2] text-mb-title'>{title}</h3>
      <p className='mt-1 max-w-[600px] text-[14px] leading-normal text-mb-mute'>
        {lead}
      </p>
    </div>
  );
}

/**
 * `/resume#skills` (the link of the About page) brings the section into view. The page panel scrolls, not the window, and it puts a new
 * page at its top after the page mounted, so the scroll waits two frames; it runs again when the roles above have loaded and moved the
 * section down.
 */
function useScrollToSkills(id: string) {
  const reduced = useReducedMotion();
  const { isPending } = useContentQuery('experience');
  useEffect(() => {
    if (window.location.hash !== `#${id}`) return;
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({
          block: 'start',
          behavior: reduced ? 'auto' : 'smooth',
        }),
      );
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [id, isPending, reduced]);
}

/** The Skills section (`#skills`, which the About page links to): the core stack as key skills, then every listed skill by area. */
export function ResumeSkills() {
  const { skills } = useCopy(resumeCopy);
  const mb = useCopy(mobaResumeCopy);
  useScrollToSkills('skills');
  return (
    <MbSection
      id='skills'
      kicker={mb.kickers.skills}
      title={skills.title}
      lead={skills.lead}
      order={2}
      className='scroll-mt-3'
    >
      <Part
        title={skills.core.title}
        lead={skills.core.lead}
        kicker={mb.kickers.core}
      />
      <ResumeCoreStack />
      <Part
        title={skills.all.title}
        lead={skills.all.lead}
        kicker={mb.kickers.areas}
      />
      <ResumeSkillGroups />
    </MbSection>
  );
}

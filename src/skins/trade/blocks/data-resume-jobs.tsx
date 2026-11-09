/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { tradeDataCopy } from '@/content/copy/trade-data';
import { useNow } from '@/hooks/use-now';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { DataEvents } from '@/skins/trade/blocks/data-events';
import { DataFinancials } from '@/skins/trade/blocks/data-financials';
import { DataRoleNotes } from '@/skins/trade/blocks/data-role-notes';
import { useReveal } from '@/skins/trade/blocks/data-use-reveal';
import { Section } from '@/skins/trade/blocks/data-resume-section';
import { HEADING } from '@/skins/trade/blocks/data-resume-section';

/** The blocks that are made of the jobs: the statement, the notes and the events. */
export function Jobs({
  jobs,
  reveal,
}: {
  jobs: Doc<'experience'>[];
  reveal: ReturnType<typeof useReveal>;
}) {
  const { experience: copy } = useCopy(resumeCopy);
  const { resume } = useCopy(tradeDataCopy);
  const { byId } = useSkills();
  const now = useNow();
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

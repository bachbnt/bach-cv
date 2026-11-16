/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSkills } from '@/components/skills/use-skills';
import { aboutCopy } from '@/content/copy/about';
import { coreStack } from '@/lib/derive/core-stack';
import { useCopy } from '@/lib/i18n/copy';
import { AboutCoreRowsSkeleton } from '@/skins/phone/blocks/about-core-rows-skeleton';
import { AboutCoreRows } from '@/skins/phone/blocks/about-core-rows';
import { SectionLink } from '@/skins/phone/blocks/section-link';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';
import { PhSection } from '@/skins/phone/ui/ph-section';

/** The skills I use every day, with where each was used, and the link to the whole list on Resume. The same data and words as Standard's core stack. */
export function AboutCoreStack() {
  const { core } = useCopy(aboutCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const stack = coreStack(skills);

  return (
    <PhSection
      title={core.title}
      className='mt-0'
      action={<SectionLink href='/resume#skills'>{core.all}</SectionLink>}
    >
      <p className='mb-3 px-1 text-[15px]/[1.5] text-ph-mute'>{core.lead}</p>
      <PhDataState
        query={{ isPending, isError, refetch }}
        count={stack.length}
        empty='coreStack'
        subject='coreStack'
        level={3}
        skeleton={<AboutCoreRowsSkeleton />}
      >
        <AboutCoreRows skills={stack} evidence={evidence} />
      </PhDataState>
    </PhSection>
  );
}

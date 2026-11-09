/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicHomeAboutCopy } from '@/content/copy/academic-home-about';
import { homeCopy } from '@/content/copy/home';
import { statesCopy } from '@/content/copy/states';
import { stripSkills } from '@/lib/derive/skill-strip';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { HomeCol } from '@/skins/academic/blocks/home-col';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

/**
 * The technologies of Standard's moving strip, written as the keywords under an abstract: the same skills in the same order and limit, still (a
 * list that does not move has no pause button to keep). With none, or if they fail to load, the block is left out, as in Standard.
 */
export function HomeKeywords() {
  const copy = useCopy(homeCopy);
  const mine = useCopy(academicHomeAboutCopy).home;
  const states = useCopy(statesCopy);
  const { data: skills = [], isPending } = useContentQuery('skills');
  const shown = stripSkills(skills);

  if (isPending) {
    return (
      <HomeCol className='mt-6'>
        <div role='status' aria-busy='true' aria-label={states.loading}>
          <AcSkeleton className='h-6 w-[min(100%,560px)]' />
        </div>
      </HomeCol>
    );
  }
  if (!shown.length) return null;

  return (
    <HomeCol className='mt-6'>
      <section
        aria-label={copy.technologies}
        className='max-w-[640px] px-1.5 text-[0.95em]'
      >
        <b className='mr-2 font-ac-note text-[1.04em] font-normal text-ac-md'>
          {mine.keywords}
        </b>
        <ul className='m-0 inline list-none p-0'>
          {shown.map((skill) => (
            <li
              key={skill.id}
              className='inline-block whitespace-nowrap after:mx-2 after:content-["·"] last:after:content-none'
            >
              {skill.name}
            </li>
          ))}
        </ul>
      </section>
    </HomeCol>
  );
}

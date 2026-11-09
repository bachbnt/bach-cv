/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicHomeAboutCopy } from '@/content/copy/academic-home-about';
import { homeCopy } from '@/content/copy/home';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { HomeCol } from '@/skins/academic/blocks/home-col';
import { AcHeading } from '@/skins/academic/ui/ac-section';
import { AcPaper } from '@/skins/academic/ui/ac-paper';

/**
 * "How a bug becomes a merge request": the three steps of the AI workflow, the method of the manuscript, on a sheet taped to the board. The words
 * are Standard's (`home.pipeline`); the steps are numbered in the order they are written.
 */
export function HomePipeline() {
  const { pipeline } = useCopy(homeCopy);
  const mine = useCopy(academicHomeAboutCopy).home;

  return (
    <HomeCol className='mt-16'>
      <AcPaper kind='pinned' wind className='rotate-[0.4deg] px-7 pt-[30px]'>
        <section aria-labelledby='pipeline-h'>
          <p
            aria-hidden='true'
            className='mb-1 font-ac-note text-[17px] tracking-[0.04em] text-ac-accent'
          >
            § {mine.method}
          </p>
          <AcHeading
            id='pipeline-h'
            className='text-[30px] [--ul:var(--ac-accent)]'
          >
            {pipeline.title}
          </AcHeading>
          <p className='mt-4 mb-6 max-w-[56ch] text-[0.95em] text-ac-mute'>
            {pipeline.subtitle}
          </p>
          <ol className='m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-x-7 gap-y-6 p-0'>
            {pipeline.steps.map((step, i) => (
              <li key={step.title} className='min-w-0'>
                <span className='font-ac-note text-[16px] text-ac-accent'>
                  {fill(mine.step, { n: i + 1 })}
                </span>
                <h3 className='m-0 mb-1.5 font-ac-chalk text-[24px]/[1.15] font-normal'>
                  {step.title}
                </h3>
                <p className='m-0 text-[0.92em] text-ac-mute'>{step.body}</p>
                {step.tags.length > 0 && (
                  <ul className='mt-2 flex list-none flex-wrap gap-1.5 p-0'>
                    {step.tags.map((tag) => (
                      <li
                        key={tag}
                        className='rounded-[12px_8px_11px_9px/9px_11px_8px_12px] border-[1.8px] border-ac-rule px-2.5 pt-px pb-0.5 font-ac-note text-[15px]'
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </section>
      </AcPaper>
    </HomeCol>
  );
}

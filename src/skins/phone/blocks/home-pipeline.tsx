/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { HomeCardHead } from '@/skins/phone/blocks/home-card-head';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import { PhChip } from '@/skins/phone/ui/ph-chip';

/** "How a bug becomes a merge request": the card of Standard's pipeline, its steps numbered in a list. */
export function HomePipeline() {
  const { pipeline } = useCopy(homeCopy);
  return (
    <HomeGlass as='section' aria-labelledby='ph-pipeline-h'>
      <HomeCardHead id='ph-pipeline-h' title={pipeline.title} />
      <p className='text-[15px]/[1.55] text-ph-mute'>{pipeline.subtitle}</p>
      <ol className='m-0 mt-4 flex list-none flex-col gap-4 p-0'>
        {pipeline.steps.map((step, index) => (
          <li key={step.title} className='flex gap-3.5'>
            <span
              aria-hidden='true'
              className='grid size-7 shrink-0 place-items-center rounded-full bg-ph-accent text-[13px] font-bold text-ph-on-accent'
            >
              {index + 1}
            </span>
            <div className='min-w-0'>
              <h3 className='text-[16px]/[1.35] font-semibold'>{step.title}</h3>
              <p className='mt-0.5 text-[15px]/[1.55] text-ph-mute'>
                {step.body}
              </p>
              {step.tags.length > 0 && (
                <ul className='m-0 mt-2 flex list-none flex-wrap gap-1.5 p-0'>
                  {step.tags.map((tag) => (
                    <li key={tag}>
                      <PhChip tone='accent'>{tag}</PhChip>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </HomeGlass>
  );
}

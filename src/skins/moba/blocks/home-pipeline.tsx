/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { homeCopy } from '@/content/copy/home';
import { mobaHomeCopy } from '@/content/copy/moba-home';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { MbChip } from '@/skins/moba/ui/mb-chip';
import { MbSection } from '@/skins/moba/ui/mb-section';

/** The bug-to-merge-request pipeline as a recall path: three numbered hexagons joined by a line, each with its text and tags. */
export function HomePipeline() {
  const { pipeline } = useCopy(homeCopy);
  const mb = useCopy(mobaHomeCopy);
  return (
    <MbSection
      kicker={mb.kickers.pipeline}
      title={pipeline.title}
      lead={pipeline.subtitle}
      order={1}
    >
      <ol className='m-0 grid list-none gap-4 p-0 min-[760px]:grid-cols-3'>
        {pipeline.steps.map((step, i) => (
          <li
            key={step.title}
            style={{ '--n': i + 1 } as CSSProperties}
            className='mb-step relative flex gap-3 min-[760px]:flex-col'
          >
            <span className='mb-hex-gold relative grid size-12 flex-none place-items-center'>
              <span className='mb-hex absolute inset-[3px] grid place-items-center bg-mb-well font-mb-display text-xl font-bold text-mb-title'>
                <span aria-hidden='true'>{i + 1}</span>
                <span className='sr-only'>{fill(mb.step, { n: i + 1 })}</span>
              </span>
            </span>
            <div className='min-w-0'>
              <h3 className='text-[21px] leading-tight text-mb-title'>
                {step.title}
              </h3>
              <p className='mt-1.5 text-[14.5px] leading-[1.5] text-mb-mute'>
                {step.body}
              </p>
              {step.tags.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-1.5'>
                  {step.tags.map((tag) => (
                    <MbChip key={tag} tone='gold'>
                      {tag}
                    </MbChip>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </MbSection>
  );
}

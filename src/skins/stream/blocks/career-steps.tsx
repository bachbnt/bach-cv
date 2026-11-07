/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronRight } from 'lucide-react';
import { Fragment, type CSSProperties } from 'react';
import { BUILD_COLORS, homeBuildCopy } from '@/content/copy/home-build';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { StreamHeading } from '@/skins/stream/ui/stream-heading';
import { StreamTag } from '@/skins/stream/ui/stream-chip';

/**
 * "How a bug becomes a merge request" (the pipeline of Standard's hero card) as a flow of frames, left to right with a chevron
 * between them (top to bottom on a phone), each with its number, title, body and tags.
 */
export function CareerFlow() {
  const { pipeline } = useCopy(homeCopy);
  return (
    <section aria-labelledby='flow-h' className='mt-8 px-3 min-[701px]:px-0'>
      <StreamHeading id='flow-h' className='mb-1'>
        {pipeline.title}
      </StreamHeading>
      <p className='max-w-[720px] text-sm text-sm-mute'>{pipeline.subtitle}</p>
      <ol className='m-0 mt-4 flex list-none flex-col gap-2 p-0 min-[900px]:flex-row min-[900px]:items-stretch'>
        {pipeline.steps.map((step, index) => (
          <Fragment key={step.title}>
            {index > 0 && (
              <li
                aria-hidden='true'
                className='grid flex-none place-items-center text-sm-mute max-[899px]:hidden'
              >
                <ChevronRight className='size-6' />
              </li>
            )}
            <li className='flex min-w-0 flex-1 flex-col gap-1.5 rounded-xl bg-sm-surface p-4'>
              <span
                aria-hidden='true'
                className='grid size-7 place-items-center rounded-full bg-sm-red text-[13px] font-bold text-white'
              >
                {index + 1}
              </span>
              <h3 className='text-base/[1.3] font-medium'>{step.title}</h3>
              <p className='text-[13px]/[1.5] text-sm-mute'>{step.body}</p>
              {step.tags.length > 0 && (
                <div className='mt-1 flex flex-wrap gap-1.5'>
                  {step.tags.map((tag) => (
                    <StreamTag key={tag}>{tag}</StreamTag>
                  ))}
                </div>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </section>
  );
}

/** "What I've built at FPT": six tiles, each with the coloured mark Standard gives it, its number, title and body. */
export function CareerBuilt() {
  const copy = useCopy(homeBuildCopy);
  return (
    <section aria-labelledby='build-h' className='mt-8 px-3 min-[701px]:px-0'>
      <StreamHeading id='build-h' className='mb-1'>
        {copy.title}
      </StreamHeading>
      <p className='max-w-[720px] text-sm text-sm-mute'>{copy.intro}</p>
      <ol className='m-0 mt-4 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-x-4 gap-y-5 p-0'>
        {copy.items.map((item, index) => (
          <li
            key={item.title}
            style={{ '--tile': BUILD_COLORS[index] } as CSSProperties}
            className='flex min-w-0 flex-col gap-2'
          >
            <div
              aria-hidden='true'
              className='relative flex aspect-[16/6] items-end overflow-hidden rounded-xl bg-[linear-gradient(135deg,color-mix(in_srgb,var(--tile)_55%,#000),color-mix(in_srgb,var(--tile)_18%,#000))] p-3'
            >
              <span className='text-5xl/none font-black text-white/85'>
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <h3 className='text-base/[1.3] font-medium'>{item.title}</h3>
            <p className='text-[13px]/[1.5] text-sm-mute'>{item.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

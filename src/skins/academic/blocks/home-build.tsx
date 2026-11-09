/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { homeBuildCopy } from '@/content/copy/home-build';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { HomeCol } from '@/skins/academic/blocks/home-col';
import { AcHeading } from '@/skins/academic/ui/ac-section';

/** The four chalk colours, one after the other, for the rule above each item. */
const TONES = [
  { rule: 'border-ac-ma', dot: 'bg-ac-ma' },
  { rule: 'border-ac-mb', dot: 'bg-ac-mb' },
  { rule: 'border-ac-mc', dot: 'bg-ac-mc' },
  { rule: 'border-ac-md', dot: 'bg-ac-md' },
] as const;

/** "What I've built at FPT": the engineering workflows of the current job, six short findings each under a rule of chalk. Standard's words. */
export function HomeBuild() {
  const copy = useCopy(homeBuildCopy);
  return (
    <HomeCol className='mt-16'>
      <section aria-labelledby='build-h'>
        <AcHeading id='build-h'>{copy.title}</AcHeading>
        <p className='mt-4 mb-8 max-w-[56ch] text-ac-mute'>{copy.intro}</p>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-x-10'>
          {copy.items.map((item, index) => {
            const tone = TONES[index % TONES.length];
            return (
              <div
                key={item.title}
                className={cn('border-t-2 pt-5 pb-7', tone.rule)}
              >
                <h3 className='ac-glow m-0 font-ac-chalk text-[26px]/[1.15] font-normal'>
                  <span
                    aria-hidden='true'
                    className={cn(
                      'mr-2.5 inline-block size-2.5 rounded-full',
                      tone.dot,
                    )}
                  />
                  {item.title}
                </h3>
                <p className='mt-2 text-[0.95em] text-ac-mute'>{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>
    </HomeCol>
  );
}

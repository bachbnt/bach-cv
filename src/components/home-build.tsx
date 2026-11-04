/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { BUILD_COLORS, homeBuildCopy } from '@/content/copy/home-build';
import { useCopy } from '@/lib/i18n/copy';

/** The dark block of engineering work at the current job, six cards with a coloured rule. */
export function HomeBuild() {
  const copy = useCopy(homeBuildCopy);
  return (
    <section
      aria-labelledby='build-h'
      className='bg-night py-24 text-background'
    >
      <div className='mx-auto w-full max-w-[1200px] px-5 min-[721px]:px-12'>
        <h2
          id='build-h'
          className='max-w-[640px] text-[30px] leading-[1.08] text-background min-[721px]:text-[40px]'
        >
          {copy.title}
        </h2>
        <p className='mt-4 max-w-[620px] text-[19px] leading-[1.55] text-[#b4bac6]'>
          {copy.intro}
        </p>
        <div className='mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] gap-x-14'>
          {copy.items.map((item, index) => (
            <div
              key={item.title}
              style={{ '--rule': BUILD_COLORS[index] } as CSSProperties}
              className='border-t-2 border-(--rule) pt-7 pb-9'
            >
              <h3 className='text-[22px] text-white'>
                <span
                  aria-hidden='true'
                  className='mr-2.5 inline-block size-2.5 rounded-full bg-(--rule)'
                />
                {item.title}
              </h3>
              <p className='mt-2.5 text-base leading-[1.6] text-[#b4bac6]'>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

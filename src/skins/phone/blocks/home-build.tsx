/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown } from 'lucide-react';
import { homeBuildCopy } from '@/content/copy/home-build';
import { useCopy } from '@/lib/i18n/copy';
import { HomeCardHead } from '@/skins/phone/blocks/home-card-head';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';

/**
 * "What I've built at FPT": the six workflows of Standard's dark block as a list of rows that open (a native disclosure: keys, no script),
 * so the card is as long as its titles until one is read.
 */
export function HomeBuild() {
  const copy = useCopy(homeBuildCopy);
  return (
    <HomeGlass as='section' aria-labelledby='ph-build-h'>
      <HomeCardHead id='ph-build-h' title={copy.title} />
      <p className='text-[15px]/[1.55] text-ph-mute'>{copy.intro}</p>
      <div className='mt-3 divide-y divide-ph-line'>
        {copy.items.map((item) => (
          <details key={item.title} className='group'>
            <summary className='flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-2 text-[16px]/[1.35] font-semibold [&::-webkit-details-marker]:hidden'>
              {item.title}
              <ChevronDown
                aria-hidden='true'
                className='size-5 shrink-0 text-ph-mute transition-transform duration-180 group-open:rotate-180'
              />
            </summary>
            <p className='pb-3.5 text-[15px]/[1.6] text-ph-mute'>{item.body}</p>
          </details>
        ))}
      </div>
    </HomeGlass>
  );
}

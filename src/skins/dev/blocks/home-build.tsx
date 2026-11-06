/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { homeBuildCopy } from '@/content/copy/home-build';
import { useCopy } from '@/lib/i18n/copy';
import { DevSection } from '@/skins/dev/ui/dev-section';
import { DevCard } from '@/skins/dev/ui/dev-card';

/** the colour of the dot of each card */
const DOTS = [
  '[--c:#e44857]',
  '[--c:#79c0ff]',
  '[--c:#d2a8ff]',
  '[--c:#7ee787]',
  '[--c:#f2cc60]',
  '[--c:#ffa657]',
];

/** The engineering work at the current job: six cards, each with a number and a coloured dot. */
export function HomeBuild() {
  const copy = useCopy(homeBuildCopy);
  return (
    <DevSection title={copy.title} sub={copy.intro}>
      <div className='grid grid-cols-3 gap-4 max-[900px]:grid-cols-2 max-[620px]:grid-cols-1'>
        {copy.items.map((item, i) => (
          <DevCard
            as='article'
            key={item.title}
            className={DOTS[i % DOTS.length]}
            style={{ '--i': i } as CSSProperties}
            data-reveal
          >
            <span
              className='mb-2.5 flex items-center gap-2 font-code text-[12px] leading-[normal] text-mute before:size-2 before:rounded-full before:bg-(--c) before:content-[""]'
              aria-hidden='true'
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <h3 className='mb-1.5 text-[16px]'>{item.title}</h3>
            <p className='m-0 text-[14px] text-mute'>{item.body}</p>
          </DevCard>
        ))}
      </div>
    </DevSection>
  );
}

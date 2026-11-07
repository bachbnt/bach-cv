/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { homeBuildCopy } from '@/content/copy/home-build';
import { mobaHomeCopy } from '@/content/copy/moba-home';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { MbCard } from '@/skins/moba/ui/mb-card';
import { MbSection } from '@/skins/moba/ui/mb-section';

/** One accent for each card: they are the palette's tokens, in the order the colours of Standard's cards go. */
const RULES = [
  'bg-mb-red',
  'bg-mb-blue',
  'bg-mb-violet',
  'bg-mb-green',
  'bg-mb-orange',
  'bg-mb-teal',
] as const;

/** "What I've built at FPT": six loadout cards, each with a coloured bar down its edge. */
export function HomeBuild() {
  const copy = useCopy(homeBuildCopy);
  const mb = useCopy(mobaHomeCopy);
  return (
    <MbSection
      kicker={mb.kickers.build}
      title={copy.title}
      lead={copy.intro}
      order={3}
    >
      <ul className='m-0 grid list-none gap-3 p-0 min-[760px]:grid-cols-2'>
        {copy.items.map((item, i) => (
          <li key={item.title}>
            <MbCard className='h-full py-4 pr-4 pl-6'>
              <span
                aria-hidden='true'
                className={cn(
                  'absolute inset-y-3 left-3 w-1',
                  RULES[i % RULES.length],
                )}
              />
              <h3 className='text-[21px] leading-tight text-mb-title'>
                {item.title}
              </h3>
              <p className='mt-2 text-[14.5px] leading-[1.55] text-mb-mute'>
                {item.body}
              </p>
            </MbCard>
          </li>
        ))}
      </ul>
    </MbSection>
  );
}

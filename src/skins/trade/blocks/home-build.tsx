/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { homeBuildCopy } from '@/content/copy/home-build';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { ShellWidget } from '@/skins/trade/ui/shell-widget';

/** The colour of the marker of each step: theme colours of the skin, so both themes work. */
const MARKS = [
  'bg-tv-down',
  'bg-tv-sky',
  'bg-tv-violet',
  'bg-tv-up',
  'bg-tv-gold',
  'bg-tv-accent',
] as const;

/** What I have built at the current job: the six items as a numbered timeline, one marker colour each. */
export function HomeBuild() {
  const copy = useCopy(homeBuildCopy);
  return (
    <ShellWidget id='tv-home-build' titleId='tv-build-h' title={copy.title}>
      <p className='px-3.5 pt-2.5 text-xs/[1.5] text-tv-mute'>{copy.intro}</p>
      <ol className='py-2'>
        {copy.items.map((item, i) => (
          <li
            key={item.title}
            className='tv-rise relative pr-3.5 pl-12 before:absolute before:top-0 before:bottom-0 before:left-[25px] before:w-px before:bg-tv-line first:before:top-5 last:before:bottom-auto last:before:h-5'
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <span
              aria-hidden='true'
              className={cn(
                'absolute top-2.5 left-3.5 grid size-[23px] place-items-center rounded-full text-[11px] font-bold text-white',
                MARKS[i % MARKS.length],
              )}
            >
              {i + 1}
            </span>
            <div className='py-2'>
              <h3 className='text-[13px] font-semibold'>{item.title}</h3>
              <p className='mt-0.5 text-xs/[1.55] text-tv-mute'>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </ShellWidget>
  );
}

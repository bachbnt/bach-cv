/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DevChip } from '@/skins/dev/ui/dev-chip';

const CELL =
  'relative border-r border-line-2 px-5 py-[18px] transition-[background] duration-[250ms] ease-[ease] last:border-r-0 hover:bg-hov max-[900px]:border-r-0 max-[900px]:border-b max-[900px]:last:border-b-0';
const TEXT = 'm-0 text-[14px] text-mute';
/** the bar of the second and third step starts later, so the three fill in turn */
const BAR_DELAY = ['', '[animation-delay:1s]', '[animation-delay:2s]'];

/** How a bug becomes a merge request: the title and its steps as one strip, each step with a bar that fills in turn. */
export function HomePipeline() {
  const { pipeline } = useCopy(homeCopy);
  return (
    <div
      className='grid grid-cols-[1.1fr_1fr_1fr_1fr] overflow-hidden rounded-[8px] border border-line-2 bg-chrome max-[900px]:grid-cols-1'
      data-reveal
    >
      <div className={CELL}>
        <h2 className='mb-1.5 text-[15px]'>{pipeline.title}</h2>
        <p className={TEXT}>{pipeline.subtitle}</p>
      </div>
      {pipeline.steps.map((step, i) => (
        <div key={step.title} className={CELL}>
          <span
            className='inline-grid size-[22px] place-items-center rounded-full bg-[color:color-mix(in_srgb,var(--and)_20%,transparent)] font-code text-[12px] leading-[normal] font-bold text-signal'
            aria-hidden='true'
          >
            {i + 1}
          </span>
          <h3 className='mt-1.5 mb-1 text-[14.5px]'>{step.title}</h3>
          <p className={TEXT}>{step.body}</p>
          {step.tags.length > 0 && (
            <div className='mt-3 flex flex-wrap gap-[7px]'>
              {step.tags.map((tag) => (
                <DevChip key={tag}>{tag}</DevChip>
              ))}
            </div>
          )}
          <span
            className={cn(
              'absolute bottom-0 left-0 h-0.5 w-full origin-left [transform:scaleX(0)] animate-[dv-fill_3.2s_ease-in-out_infinite] bg-[image:linear-gradient(90deg,var(--and),transparent)]',
              BAR_DELAY[i],
            )}
            aria-hidden='true'
          />
        </div>
      ))}
    </div>
  );
}

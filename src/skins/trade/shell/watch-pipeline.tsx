/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Lightbulb } from 'lucide-react';
import { homeCopy } from '@/content/copy/home';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { useCopy } from '@/lib/i18n/copy';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/**
 * The "idea" card of the Details widget on Home: how a bug becomes a merge request (the pipeline block of the Standard hero), with
 * its three steps. A summary of work I did, not a prediction.
 */
export function WatchPipeline() {
  const { pipeline } = useCopy(homeCopy);
  const words = useCopy(tradeShellCopy).details;
  return (
    <section aria-labelledby='tv-pipeline-h' className='p-3.5'>
      <p className='mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-tv-gold uppercase'>
        <Lightbulb aria-hidden='true' className='size-3.5' />
        {words.idea}
      </p>
      <h2
        id='tv-pipeline-h'
        className='text-[13px] leading-snug font-bold text-tv-ink'
      >
        {pipeline.title}
      </h2>
      <p className='mt-1 mb-3 text-xs/[1.5] text-tv-mute'>
        {pipeline.subtitle}
      </p>
      <ol className='grid gap-3'>
        {pipeline.steps.map((step, i) => (
          <li
            key={step.title}
            className='tv-rise grid grid-cols-[22px_minmax(0,1fr)] gap-2'
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <span
              aria-hidden='true'
              className='grid size-[22px] place-items-center rounded-full bg-tv-hover text-[11px] font-bold text-tv-accent-ink'
            >
              {i + 1}
            </span>
            <div>
              <h3 className='text-[13px] font-semibold'>{step.title}</h3>
              <p className='text-xs/[1.5] text-tv-mute'>{step.body}</p>
              {step.tags.length > 0 && (
                <div className='mt-1 flex flex-wrap gap-1'>
                  {step.tags.map((tag) => (
                    <TvChip key={tag} className='font-normal text-tv-ink'>
                      {tag}
                    </TvChip>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

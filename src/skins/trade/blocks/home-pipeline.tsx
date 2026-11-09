/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Lightbulb } from 'lucide-react';
import { homeCopy } from '@/content/copy/home';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { useCopy } from '@/lib/i18n/copy';
import { ShellWidget } from '@/skins/trade/ui/shell-widget';
import { TvChip } from '@/skins/trade/ui/tv-chip';

/**
 * The pipeline card of the Standard hero (how a bug becomes a merge request, with its three steps) as an idea of the Home dashboard. It
 * is a block of Home, not of the watchlist, so it stays whatever the Layout menu turns off. A summary of work I did, not a prediction.
 */
export function HomePipeline() {
  const { pipeline } = useCopy(homeCopy);
  const words = useCopy(tradeShellCopy).details;
  return (
    <ShellWidget
      id='tv-home-pipeline'
      titleId='tv-pipeline-h'
      title={pipeline.title}
      bodyClassName='p-3.5'
    >
      <p className='mb-1.5 flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-tv-gold-ink uppercase'>
        <Lightbulb aria-hidden='true' className='size-3.5' />
        {words.idea}
      </p>
      <p className='mb-3 text-xs/[1.5] text-tv-mute'>{pipeline.subtitle}</p>
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
    </ShellWidget>
  );
}

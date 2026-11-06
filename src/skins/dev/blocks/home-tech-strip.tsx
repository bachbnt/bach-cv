/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { statesCopy } from '@/content/copy/states';
import { cn } from '@/lib/utils';
import { DevChip } from '@/skins/dev/ui/dev-chip';

const CATEGORY_ORDER = ['mobile', 'web', 'ai', 'tools'] as const;
const LIMIT = 20;

/** A slow marquee of skills, mobile first. It stops on hover, with a pause button, and becomes a wrapped list for reduced motion. */
export function HomeTechStrip() {
  const copy = useCopy(homeCopy);
  const states = useCopy(statesCopy);
  // a moving list needs a way to stop it that does not need a mouse (WCAG 2.2.2)
  const [paused, setPaused] = useState(false);
  const { data: skills = [], isPending } = useContentQuery('skills');
  const shown = CATEGORY_ORDER.flatMap((category) =>
    skills.filter((s) => s.listed && s.category === category),
  ).slice(0, LIMIT);

  if (isPending) {
    return (
      <div
        role='status'
        aria-busy='true'
        aria-label={states.loading}
        className='mt-7'
      >
        <DevSkeleton className='h-7' />
      </div>
    );
  }
  if (!shown.length) return null;

  const chips = (prefix: string) =>
    shown.map((s) => (
      <DevChip key={`${prefix}-${s.id}`} tone={s.category}>
        {s.name}
      </DevChip>
    ));

  return (
    <div className='relative mt-7'>
      <section
        aria-label={copy.technologies}
        className='overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:[mask-image:none]'
      >
        <div
          className={cn(
            'flex w-max animate-[dv-marquee_45s_linear_infinite] gap-2.5 hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:animate-none',
            paused && '[animation-play-state:paused]',
          )}
        >
          {chips('a')}
          <span aria-hidden='true' className='contents motion-reduce:hidden'>
            {chips('b')}
          </span>
        </div>
      </section>
      <button
        type='button'
        aria-pressed={paused}
        aria-label={paused ? copy.playTechnologies : copy.pauseTechnologies}
        onClick={() => setPaused((on) => !on)}
        className='absolute top-1/2 right-2 z-10 inline-grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full border border-line-2 bg-chrome text-mute transition-colors hover:text-head motion-reduce:hidden pointer-coarse:size-11'
      >
        {paused ? (
          <Play className='size-3.5' aria-hidden='true' />
        ) : (
          <Pause className='size-3.5' aria-hidden='true' />
        )}
      </button>
    </div>
  );
}

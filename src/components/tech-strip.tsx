/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { ChipsSkeleton } from '@/components/chips-skeleton';
import { LoadingBlock } from '@/components/loading-block';
import { Tag, type TagTone } from '@/components/tag';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { SKILL_CATEGORIES } from '@/lib/content/schema';
import { cn } from 'cn';
import { useContentQuery } from '@/lib/query/use-content';

const TONE: Record<(typeof SKILL_CATEGORIES)[number], TagTone> = {
  mobile: 'mobile',
  web: 'web',
  ai: 'ai',
  tools: 'tools',
};
/** Mobile first, as on the mockup. */
const CATEGORY_ORDER = ['mobile', 'web', 'ai', 'tools'] as const;
const LIMIT = 20;

/** A slow marquee of skills. It stops on hover, with a pause button, and becomes a wrapped list for reduced motion. */
export function TechStrip({ className }: { className?: string }) {
  const copy = useCopy(homeCopy);
  // a moving list needs a way to stop it that does not need a mouse (WCAG 2.2.2)
  const [paused, setPaused] = useState(false);
  const { data: skills = [], isPending } = useContentQuery('skills');
  const shown = CATEGORY_ORDER.flatMap((category) =>
    skills.filter((s) => s.listed && s.category === category),
  ).slice(0, LIMIT);
  if (isPending)
    return (
      <LoadingBlock
        className={cn(
          'mx-auto w-full max-w-[1200px] px-5 min-[721px]:px-12',
          className,
        )}
      >
        <ChipsSkeleton count={8} className='justify-center' />
      </LoadingBlock>
    );
  if (!shown.length) return null;

  const chips = (hidden: boolean) =>
    shown.map((s) => (
      <Tag key={`${hidden ? 'b' : 'a'}-${s.id}`} tone={TONE[s.category]}>
        {s.name}
      </Tag>
    ));

  return (
    <div className={cn('relative', className)}>
      <section
        aria-label={copy.technologies}
        className='overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:[mask-image:none]'
      >
        <div
          className={cn(
            'flex w-max animate-marquee gap-3 hover:[animation-play-state:paused] active:[animation-play-state:paused] motion-reduce:mx-auto motion-reduce:w-auto motion-reduce:max-w-[1200px] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-5',
            paused && '[animation-play-state:paused]',
          )}
        >
          {chips(false)}
          <span aria-hidden='true' className='contents motion-reduce:hidden'>
            {chips(true)}
          </span>
        </div>
      </section>
      <button
        type='button'
        aria-pressed={paused}
        aria-label={paused ? copy.playTechnologies : copy.pauseTechnologies}
        onClick={() => setPaused((on) => !on)}
        className='absolute top-1/2 right-3 z-10 inline-grid size-9 -translate-y-1/2 place-items-center rounded-full border bg-card text-foreground shadow-sm transition-colors hover:bg-muted active:bg-muted motion-reduce:hidden pointer-coarse:size-11'
      >
        {paused ? (
          <Play className='size-4' aria-hidden='true' />
        ) : (
          <Pause className='size-4' aria-hidden='true' />
        )}
      </button>
    </div>
  );
}

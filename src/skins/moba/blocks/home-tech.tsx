/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Pause, Play } from 'lucide-react';
import { useState } from 'react';
import { homeCopy } from '@/content/copy/home';
import { mobaHomeCopy } from '@/content/copy/moba-home';
import { stripSkills } from '@/lib/derive/skill-strip';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { useContentQuery } from '@/lib/query/use-content';
import { MbChip } from '@/skins/moba/ui/mb-chip';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/**
 * The technologies strip: the listed skills of each area in the order Standard uses, in a slow marquee that stops under the pointer, has a
 * pause button (a moving list needs one that does not need a mouse) and becomes a wrapped list for reduced motion.
 */
export function HomeTech() {
  const copy = useCopy(homeCopy);
  const mb = useCopy(mobaHomeCopy);
  const [paused, setPaused] = useState(false);
  const { data: skills = [], isPending } = useContentQuery('skills');
  const shown = stripSkills(skills);
  if (isPending)
    return (
      <div role='status' aria-busy='true' className='px-6 py-4'>
        <MbSkeleton className='h-9' />
      </div>
    );
  if (!shown.length) return null;
  const chips = (copyOf: string) =>
    shown.map((skill) => (
      <MbChip
        key={`${copyOf}-${skill.id}`}
        tone={skill.category}
        className='px-3.5 py-2 text-[13px]'
      >
        {skill.name}
      </MbChip>
    ));
  return (
    <section
      aria-label={copy.technologies}
      data-part=''
      style={{ '--i': 1 } as React.CSSProperties}
      className='mb-rise relative border-y border-mb-line/60 bg-mb-well/60 py-4'
    >
      <p className='mb-3 px-6 text-[10px] leading-none font-bold tracking-[0.22em] text-mb-teal-ink uppercase max-[719px]:px-4'>
        {mb.kickers.skills}
      </p>
      <div className='mb-marquee-mask overflow-hidden pr-14'>
        <div className={cn('mb-marquee', paused && 'mb-marquee-paused')}>
          {chips('a')}
          <span aria-hidden='true' className='contents'>
            {chips('b')}
          </span>
        </div>
      </div>
      <button
        type='button'
        aria-pressed={paused}
        aria-label={paused ? copy.playTechnologies : copy.pauseTechnologies}
        onClick={() => setPaused((on) => !on)}
        className='mb-top-btn absolute right-3 bottom-4 grid size-10 cursor-pointer place-items-center text-mb-gold-ink max-[1099px]:size-11 motion-reduce:hidden'
      >
        {paused ? (
          <Play aria-hidden='true' className='size-4' />
        ) : (
          <Pause aria-hidden='true' className='size-4' />
        )}
      </button>
    </section>
  );
}

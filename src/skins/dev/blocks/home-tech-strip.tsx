/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { DevSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { statesCopy } from '@/content/copy/states';
import { DevChip } from '@/skins/dev/ui/dev-chip';

const CATEGORY_ORDER = ['mobile', 'web', 'ai', 'tools'] as const;
const LIMIT = 20;

/** A slow marquee of skills, mobile first. It stops on hover and becomes a wrapped list for reduced motion. */
export function HomeTechStrip() {
  const copy = useCopy(homeCopy);
  const states = useCopy(statesCopy);
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
    <section
      aria-label={copy.technologies}
      className='mt-7 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:[mask-image:none]'
    >
      <div className='flex w-max animate-[dv-marquee_45s_linear_infinite] gap-2.5 hover:[animation-play-state:paused] motion-reduce:w-auto motion-reduce:flex-wrap motion-reduce:animate-none'>
        {chips('a')}
        <span aria-hidden='true' className='contents motion-reduce:hidden'>
          {chips('b')}
        </span>
      </div>
    </section>
  );
}

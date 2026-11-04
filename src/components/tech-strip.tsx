/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

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

/** A slow marquee of skills. It stops on hover and becomes a wrapped list for reduced motion. */
export function TechStrip({ className }: { className?: string }) {
  const copy = useCopy(homeCopy);
  const { data: skills = [] } = useContentQuery('skills');
  const shown = CATEGORY_ORDER.flatMap((category) =>
    skills.filter((s) => s.listed && s.category === category),
  ).slice(0, LIMIT);
  if (!shown.length) return null;

  const chips = (hidden: boolean) =>
    shown.map((s) => (
      <Tag key={`${hidden ? 'b' : 'a'}-${s.id}`} tone={TONE[s.category]}>
        {s.name}
      </Tag>
    ));

  return (
    <section
      aria-label={copy.technologies}
      className={cn(
        'overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-reduce:[mask-image:none]',
        className,
      )}
    >
      <div className='flex w-max animate-marquee gap-3 hover:[animation-play-state:paused] motion-reduce:mx-auto motion-reduce:w-auto motion-reduce:max-w-[1200px] motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-5'>
        {chips(false)}
        <span aria-hidden='true' className='contents motion-reduce:hidden'>
          {chips(true)}
        </span>
      </div>
    </section>
  );
}

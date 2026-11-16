/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { SectionLink } from '@/skins/phone/blocks/section-link';

/** The head of a card of the feed: its title, and the link to the whole of it ("Full resume") at the end. */
export function HomeCardHead({
  id,
  title,
  href,
  all,
}: {
  id: string;
  title: ReactNode;
  href?: string;
  /** the words of the link */
  all?: string;
}) {
  return (
    <div className='mb-3 flex items-center justify-between gap-3'>
      <h2 id={id} className='text-[19px]/[1.2] font-bold tracking-[-0.01em]'>
        {title}
      </h2>
      {href && all && <SectionLink href={href}>{all}</SectionLink>}
    </div>
  );
}

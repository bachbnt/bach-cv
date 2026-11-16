/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Star } from 'lucide-react';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { PhChip } from '@/skins/phone/ui/ph-chip';

/** The marker of a featured project: the word of Standard with a star, never the colour alone. */
export function ProjectFeatured() {
  const copy = useCopy(projectsCopy);
  return (
    <PhChip tone='accent' className='h-7 gap-1.5 text-[13px]'>
      <Star aria-hidden='true' className='size-3.5 fill-current' />
      {copy.featuredTag}
    </PhChip>
  );
}

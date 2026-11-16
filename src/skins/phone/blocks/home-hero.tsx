/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';

/** The greeting of the home screen: the line that Standard puts first, large, on the wallpaper (large and heavy enough to be read there). */
export function HomeHero() {
  const copy = useCopy(homeCopy);
  return (
    <h1 className='px-1 pt-2 text-[30px]/[1.12] font-extrabold tracking-[-0.02em] text-ph-glass-ink [text-wrap:balance] @min-[900px]:text-[40px]/[1.1]'>
      {copy.title}
    </h1>
  );
}

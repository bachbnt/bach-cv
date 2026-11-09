/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { useYearsText } from '@/lib/query/use-career-years';
import { DownloadCvButton } from '@/skins/trade/shell/download-cv-button';
import { TvAskButton } from '@/skins/trade/ui/tv-ask-button';

/**
 * The hero of Home, as the note beside the symbol overview: the title (the one `h1`), the intro and the two buttons of the Standard
 * hero (Download CV and Ask BB Bot, each with its `site/live` switch). The page's own gate decides whether Home shows at all.
 */
export function HeroNote() {
  const copy = useCopy(homeCopy);
  const intro = useYearsText(copy.intro, copy.introUndated);
  return (
    <section
      aria-labelledby='tv-hero-h'
      className='tv-rise flex flex-col justify-center gap-3 rounded-md border border-l-2 border-tv-line border-l-tv-accent bg-tv-panel p-4'
    >
      <h1
        id='tv-hero-h'
        className='text-[length:clamp(19px,2vw,26px)] leading-[1.2] font-bold'
      >
        {copy.title}
      </h1>
      <p className='max-w-[620px] text-[13px]/[1.6] text-tv-mute'>{intro}</p>
      <div className='mt-1 flex flex-wrap gap-2'>
        <DownloadCvButton label={copy.downloadCv} size='lg' />
        <TvAskButton size='lg' />
      </div>
    </section>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { devHomeAboutCopy } from '@/content/copy/dev-home-about';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { useYearsText } from '@/lib/query/use-career-years';
import { HomePipeline } from '@/skins/dev/blocks/home-pipeline';
import { HomePortrait } from '@/skins/dev/blocks/home-portrait';
import { HomeProfileWindow } from '@/skins/dev/blocks/home-profile-window';
import { DevAskBotButton } from '@/skins/dev/ui/dev-ask-bot-button';
import { DevDownloadCv } from '@/skins/dev/ui/dev-download-cv';
import { DevButtonGroup } from '@/skins/dev/ui/dev-button';
import { DevCaret } from '@/skins/dev/ui/dev-caret';
import { DevTerm, DevTermBody } from '@/skins/dev/ui/dev-term';
import { DevTermBar } from '@/skins/dev/ui/dev-term-bar';

const COMMAND = 'whoami';

/** The opening of Home: a terminal card with the title and the two buttons, the profile window and photo beside it, then the pipeline. */
export function HomeHero() {
  const copy = useCopy(homeCopy);
  const intro = useYearsText(copy.intro, copy.introUndated);
  const { titleHighlight } = useCopy(devHomeAboutCopy);
  const at = copy.title.indexOf(titleHighlight);

  return (
    <>
      <div className='grid grid-cols-[1.1fr_1fr] items-stretch gap-[26px] pt-[34px] pb-6 max-[900px]:grid-cols-1 [&>*]:min-w-0'>
        <DevTerm data-reveal>
          <DevTermBar />
          <DevTermBody>
            <div aria-hidden='true'>
              <span className='text-signal'>➜</span>{' '}
              <span className='text-sky'>~</span>{' '}
              <span
                className='dv-typed'
                style={{ '--n': COMMAND.length } as CSSProperties}
              >
                {COMMAND}
              </span>
            </div>
            <h1>
              {at < 0 ? (
                copy.title
              ) : (
                <>
                  {copy.title.slice(0, at)}
                  <span className='text-signal'>{titleHighlight}</span>
                  {copy.title.slice(at + titleHighlight.length)}
                </>
              )}
              <DevCaret />
            </h1>
            <p className='mb-[18px] max-w-[640px] font-sans text-[17px] leading-[1.65] font-normal text-ink'>
              {intro}
            </p>
            <div className='text-cmt italic' aria-hidden='true'>
              # what next?
            </div>
            <DevButtonGroup>
              <DevDownloadCv label={copy.downloadCv} />
              <DevAskBotButton />
            </DevButtonGroup>
          </DevTermBody>
        </DevTerm>
        <div className='flex min-w-0 flex-col gap-4' data-reveal>
          <HomeProfileWindow />
          <HomePortrait />
        </div>
      </div>
      <HomePipeline />
    </>
  );
}

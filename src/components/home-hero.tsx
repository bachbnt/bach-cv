/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import type { CSSProperties } from 'react';
import { AskBotButton } from '@/components/chat/ask-bot-button';
import { DownloadCv } from '@/components/download-cv';
import { Tag } from '@/components/tag';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { shell } from '@/lib/content/shell';

const wrap = 'mx-auto w-full max-w-[1200px] px-5 min-[721px]:px-12';

/** The tinted opening block: greeting, title, intro, the CV button, the photo and the pipeline card across its lower edge. */
export function HomeHero() {
  const copy = useCopy(homeCopy);
  const { pipeline } = copy;
  return (
    <div className='rounded-b-[40px] bg-page-tint'>
      <section
        className={`${wrap} flex flex-wrap items-center gap-14 pt-12 pb-14 min-[721px]:pt-[72px]`}
      >
        <div className='flex min-w-0 flex-[1_1_460px] flex-col gap-8'>
          <p
            style={{ '--i': 0 } as CSSProperties}
            className='hi text-[17px] leading-normal text-[#3a404c]'
          >
            {copy.greeting}
          </p>
          <h1
            style={{ '--i': 1 } as CSSProperties}
            className='hi max-w-[600px] text-[38px] leading-[1.04] min-[721px]:text-[60px]'
          >
            {copy.title}
          </h1>
          <p
            style={{ '--i': 2 } as CSSProperties}
            className='hi max-w-[560px] text-xl leading-[1.55] text-[#2b303a]'
          >
            {copy.intro}
          </p>
          <div
            style={{ '--i': 3 } as CSSProperties}
            className='hi flex flex-col items-stretch gap-3 min-[481px]:flex-row min-[481px]:items-center'
          >
            <DownloadCv
              label={copy.downloadCv}
              className='min-[481px]:max-w-[220px] min-[481px]:flex-[1_1_180px]'
            />
            <AskBotButton className='min-[481px]:max-w-[220px] min-[481px]:flex-[1_1_180px]' />
          </div>
        </div>
        <div className='min-w-0 flex-[1_1_380px]'>
          {shell.avatar && (
            <Image
              src={shell.avatar}
              alt={`${shell.name} reading a book`}
              width={600}
              height={560}
              priority
              className='photo-in h-[420px] w-full rounded-[20px] bg-border object-cover object-[50%_35%] min-[901px]:h-[560px]'
            />
          )}
        </div>
      </section>

      <div className={`${wrap} relative z-10 -mb-[88px] max-[900px]:-mb-0`}>
        <div
          style={{ '--i': 5 } as CSSProperties}
          className='hi flex flex-wrap items-start gap-x-12 gap-y-6 rounded-[20px] border bg-white px-8 py-7 shadow-[0_18px_40px_rgba(27,31,39,.14)]'
        >
          <div className='flex-[0_1_300px]'>
            <h2 className='text-xl leading-tight'>{pipeline.title}</h2>
            <p className='mt-1.5 text-sm text-muted-foreground'>
              {pipeline.subtitle}
            </p>
          </div>
          <ol className='m-0 grid flex-[1_1_560px] list-none grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-6 p-0'>
            {pipeline.steps.map((step, i) => (
              <li
                key={step.title}
                className='relative flex min-w-0 flex-col gap-2 not-last:after:absolute not-last:after:top-[11px] not-last:after:right-[-20px] not-last:after:left-9 not-last:after:hidden not-last:after:h-0.5 not-last:after:rounded-[1px] not-last:after:bg-border not-last:after:content-[""] min-[901px]:not-last:after:block'
              >
                <span
                  aria-hidden='true'
                  style={{ '--n': i + 1 } as CSSProperties}
                  className='step-on relative z-10 inline-flex size-6 items-center justify-center rounded-full bg-night text-[13px] font-semibold text-white'
                >
                  {i + 1}
                </span>
                <h3 className='text-base tracking-[-0.01em]'>{step.title}</h3>
                <p className='text-[14.5px] leading-[1.45] text-muted-foreground'>
                  {step.body}
                </p>
                {step.tags.length > 0 && (
                  <div className='mt-0.5 flex flex-wrap gap-1.5'>
                    {step.tags.map((tag) => (
                      <Tag key={tag}>{tag}</Tag>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

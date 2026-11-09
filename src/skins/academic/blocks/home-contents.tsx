/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { academicCopy } from '@/content/copy/academic';
import { academicHomeAboutCopy } from '@/content/copy/academic-home-about';
import { commonCopy } from '@/content/copy/common';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PAGE_META } from '@/lib/pages';
import { cn } from '@/lib/utils';
import { shownPages } from '@/skins/academic/config';
import { HomeCol } from '@/skins/academic/blocks/home-col';
import { AcHeading } from '@/skins/academic/ui/ac-section';

/**
 * The contents of the manuscript: a line for each page that is on, with its number and a dotted leader, like the contents of a book. It is the
 * same set of pages as the tabs (a page that is `soon` is a line without a link, a hidden one is not there); the numbers are the page numbers.
 */
export function HomeContents() {
  const home = useCopy(academicHomeAboutCopy).home;
  const copy = useCopy(academicCopy);
  const common = useCopy(commonCopy);
  const live = useLive();
  const label = (key: PageKey) =>
    key === 'home' ? copy.home : common.nav[key];

  return (
    <HomeCol className='mt-11'>
      <AcHeading>
        <span
          aria-hidden='true'
          className='font-ac-chalk text-ac-accent min-[900px]:absolute min-[900px]:top-[0.08em] min-[900px]:-left-[1.1em] max-[899px]:mr-2'
        >
          §
        </span>
        {home.contents}
      </AcHeading>
      <ol className='mt-2 list-none p-0 min-[761px]:columns-2 min-[761px]:gap-x-10'>
        {shownPages(live).map((key, i) => {
          const soon = live.pages[key] === 'soon';
          const line = (
            <>
              <span
                aria-hidden='true'
                className='min-w-5 font-ac-chalk text-[24px]/none text-ac-accent'
              >
                {i + 1}
              </span>
              <span>{label(key)}</span>
              {soon && (
                <small className='rounded-full border border-ac-rule px-1.5 text-[13px] text-ac-mute'>
                  {common.soon}
                </small>
              )}
              <span
                aria-hidden='true'
                className='min-w-3 flex-1 -translate-y-1 border-b-2 border-dotted border-ac-rule'
              />
              <span aria-hidden='true' className='font-ac-note'>
                {i + 1}
              </span>
            </>
          );
          const cls =
            'flex items-baseline gap-2 py-[5px] text-ac-ink no-underline';
          return (
            <li key={key} className='break-inside-avoid'>
              {soon ? (
                <span className={cn(cls, 'cursor-default text-ac-mute')}>
                  {line}
                </span>
              ) : (
                <Link
                  href={PAGE_META[key].href}
                  className={cn(
                    cls,
                    'hover:[&>span:nth-child(2)]:underline hover:[&>span:nth-child(2)]:underline-offset-[3px]',
                  )}
                >
                  {line}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </HomeCol>
  );
}

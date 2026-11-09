/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PAGE_META } from '@/lib/pages';
import { cn } from '@/lib/utils';
import { usePageLabels } from '@/skins/academic/shell/use-page-labels';
import { AcSoonTag } from '@/skins/academic/ui/ac-soon-tag';
import { shownPages } from '@/lib/derive/shown-pages';

/**
 * The contents under the header: one tab for each page that is on (a page that is `soon` is a tab without a link, a hidden one is not there).
 * The names are the Standard ones, numbered; the open page is underlined with a wavy line.
 */
export function Toc({ page }: { page: PageKey }) {
  const common = useCopy(commonCopy);
  const { label } = usePageLabels();
  const live = useLive();

  return (
    <nav
      aria-label={common.mainNav}
      className='mx-auto max-w-[1120px] px-5 max-[760px]:px-3.5'
    >
      <ol className='m-0 flex list-none gap-x-2.5 overflow-x-auto border-y-2 border-dashed border-ac-rule p-0 [scrollbar-width:none] max-[760px]:flex-nowrap max-[760px]:[mask-image:linear-gradient(90deg,#000_88%,transparent)] max-[760px]:pr-9 min-[761px]:flex-wrap [&::-webkit-scrollbar]:hidden'>
        {shownPages(live.pages).map((key, i) => {
          const current = key === page;
          const soon = live.pages[key] === 'soon';
          const inner = (
            <>
              <i
                aria-hidden='true'
                className={cn(
                  'font-ac-note text-[14px] not-italic opacity-75',
                  current && 'text-ac-accent opacity-100',
                )}
              >
                {i + 1}
              </i>
              {label(key)}
              {soon && <AcSoonTag />}
            </>
          );
          const cls = cn(
            'ac-line ac-toc-link relative flex items-baseline gap-2 py-[11px] pr-2.5 pb-3.5 font-ac-note text-[19px]/[1.2] whitespace-nowrap text-ac-mute no-underline transition-colors hover:text-ac-ink',
            current &&
              'text-ac-ink [--ac-line-y:3px] [--ac-line-h:7px] after:right-2.5 after:left-0',
            !current && 'after:hidden',
          );
          return (
            <li key={key}>
              {soon ? (
                <span className={cn(cls, 'cursor-default hover:text-ac-mute')}>
                  {inner}
                </span>
              ) : (
                <Link
                  href={PAGE_META[key].href}
                  className={cls}
                  aria-current={current ? 'page' : undefined}
                >
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

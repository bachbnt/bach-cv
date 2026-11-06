/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { devCopy } from '@/content/copy/dev';
import { useLive } from '@/hooks/use-live';
import { NAV_PAGES, PAGE_META } from '@/lib/pages';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DEV_FILES } from '@/skins/dev/config';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { FileIcon } from '@/skins/dev/icons/file-icon';

/** A tab: the file icon lifts when the pointer is over it and the cross shows up; the open tab has a green line on top. */
const TAB =
  'group/tab relative inline-flex items-center gap-2 border-r border-line bg-chrome-2 px-3.5 font-sans text-[13px] leading-[normal] whitespace-nowrap transition-[background-color,color] duration-150 hover:text-ink hover:[&_.dv-fi]:[transform:translateY(-1px)_scale(1.15)]';

/** The pages in the order of the site, Home first. */
const ORDER: PageKey[] = ['home', ...NAV_PAGES];

/** One tab for each page, in the order of the navigation. */
export function TabBar({ page }: { page: PageKey }) {
  const common = useCopy(commonCopy);
  const dev = useCopy(devCopy);
  const live = useLive();

  return (
    <nav
      className='flex h-[35px] items-stretch overflow-x-auto bg-chrome [scrollbar-width:none] max-[900px]:hidden'
      aria-label='Main'
    >
      {ORDER.map((key) => {
        const state = live.pages[key];
        if (state === 'hidden') return null;
        const file = DEV_FILES[key];
        const content = (
          <>
            <FileIcon kind={file.kind} />
            {file.name}
            {state === 'soon' && (
              <small className='ml-1 rounded-full border border-line-2 px-[7px] font-code text-[10.5px] leading-[normal] font-semibold tracking-[0.04em] uppercase'>
                {common.soon}
              </small>
            )}
            <span
              className={cn(
                'ml-1.5 inline-grid size-[18px] place-items-center rounded-[4px] text-mute opacity-0 group-hover/tab:opacity-80 hover:bg-hov hover:text-head',
                key === page && 'opacity-80',
              )}
              aria-hidden='true'
            >
              <DevIcon name='close' className='size-3.5' />
            </span>
          </>
        );
        if (state === 'soon') {
          return (
            <span
              key={key}
              className={cn(
                TAB,
                'cursor-default text-dim hover:text-dim [&_.dv-fi]:opacity-[0.55]',
              )}
              aria-disabled='true'
              title={dev.closeTab}
            >
              {content}
            </span>
          );
        }
        return (
          <Link
            key={key}
            data-slot='dev-tab'
            href={PAGE_META[key].href}
            className={cn(
              TAB,
              'text-ink',
              key === page &&
                'bg-editor text-head before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:origin-left before:animate-[dv-tabline_0.45s_cubic-bezier(0.2,0.7,0.2,1)_both] before:bg-signal before:content-[""]',
            )}
            aria-current={key === page ? 'page' : undefined}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

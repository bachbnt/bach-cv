/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { LoadingBlock } from '@/components/loading-block';
import { commonCopy } from '@/content/copy/common';
import { projectsCopy } from '@/content/copy/projects';
import { useLive } from '@/hooks/use-live';
import { platformCounts } from '@/lib/derive/platform-counts';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import {
  WIDGET_FOOTER,
  WIDGET_HERO,
} from '@/skins/phone/blocks/home-widget-layout';
import { HomeWidgetNumber } from '@/skins/phone/blocks/home-widget-number';
import { HomeWidgetTitle } from '@/skins/phone/blocks/home-widget-title';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';
import { PhSkeletonLine } from '@/skins/phone/ui/ph-skeleton-line';

/** What the seed has: the platforms the projects run on, a row for each. */
const PLATFORMS = 4;

/**
 * The widget of the projects: how many there are and how many run on each platform (the number is the datum, the bar only shows it). It
 * is left out when the page is switched off or the projects cannot be read, and opens the Projects page.
 */
export function HomePlatforms() {
  const common = useCopy(commonCopy);
  const copy = useCopy(projectsCopy);
  const live = useLive();
  const projects = useContentQuery('projects');
  const list = projects.data ?? [];
  const counts = platformCounts(list);
  const widest = Math.max(1, ...counts.map(({ count }) => count));

  if (live.pages.projects === 'hidden') return null;
  if (projects.isPending)
    return (
      <LoadingBlock className='min-w-0'>
        <HomeGlass className='flex h-full flex-col'>
          <HomeWidgetTitle>{common.nav.projects}</HomeWidgetTitle>
          <div className={WIDGET_HERO}>
            <PhSkeletonLine line='h-9' className='w-12' />
          </div>
          <div className={cn(WIDGET_FOOTER, 'space-y-1')}>
            {Array.from({ length: PLATFORMS }, (_, index) => (
              <div key={index}>
                <PhSkeletonLine line='h-4' className='w-2/3' />
                <PhSkeleton className='mt-0.5 h-1.5 w-full' />
              </div>
            ))}
          </div>
        </HomeGlass>
      </LoadingBlock>
    );
  if (projects.isError || list.length === 0) return null;

  const body = (
    <>
      <HomeWidgetTitle>{common.nav.projects}</HomeWidgetTitle>
      <div className={WIDGET_HERO}>
        <HomeWidgetNumber>{list.length}</HomeWidgetNumber>
      </div>
      <ul className={cn(WIDGET_FOOTER, 'm-0 list-none space-y-1 p-0')}>
        {counts.map(({ platform, count }) => (
          <li key={platform}>
            <span className='flex items-baseline justify-between gap-2 text-[13px]/[1.2] font-semibold'>
              <span className='truncate'>{copy.platforms[platform]}</span>
              <span className='tabular-nums'>{count}</span>
            </span>
            <span
              aria-hidden='true'
              className='mt-0.5 block h-1.5 rounded-ph-inner bg-ph-sheet-3'
            >
              <span
                className='block h-full rounded-ph-inner bg-ph-accent'
                style={{ width: `${(count / widest) * 100}%` }}
              />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
  const className = 'h-full min-w-0';
  return live.pages.projects === 'on' ? (
    <HomeGlass className={cn(className, 'p-0')}>
      <Link
        href='/projects'
        className='flex h-full flex-col rounded-ph-panel p-4 no-underline transition-[scale] duration-100 active:scale-[0.99]'
      >
        {body}
      </Link>
    </HomeGlass>
  ) : (
    <HomeGlass className={cn(className, 'flex flex-col')}>{body}</HomeGlass>
  );
}

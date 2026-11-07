/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import { useLive } from '@/hooks/use-live';
import { PAGES } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PAGE_META } from '@/lib/pages';
import { cn } from '@/lib/utils';
import { PLACE, PLACE_ORDER } from '@/skins/moba/config';
import { pageName } from '@/skins/moba/map/page-name';
import { useGame } from '@/skins/moba/shell/game-context';
import { MbKbd } from '@/skins/moba/ui/mb-kbd';

/**
 * The list of places: a link for every page (the real, keyboard-reachable way around, with the key of each one beside it). A page that
 * is coming soon is marked and is not a link; a hidden page is not listed, as in the Standard menu. On the left of a wide screen the
 * links stack as icons; in the phone's menu they are rows.
 */
export function PlacesList({
  layout,
  onNavigate,
}: {
  layout: 'rail' | 'rows';
  onNavigate?: () => void;
}) {
  const common = useCopy(commonCopy);
  const copy = useCopy(mobaCopy);
  const live = useLive();
  const { current, goToPage } = useGame();
  return (
    <nav aria-label={common.mainNav}>
      <ul
        className={cn(
          'flex gap-1.5',
          layout === 'rail' ? 'flex-col' : 'flex-col gap-2',
        )}
      >
        {PLACE_ORDER.filter(
          (page) => PAGES.includes(page) && live.pages[page] !== 'hidden',
        ).map((page) => {
          const { icon: Icon, key } = PLACE[page];
          const name = pageName(page, common, copy);
          const soon = live.pages[page] === 'soon';
          const content = (
            <>
              <Icon
                aria-hidden='true'
                className={cn(
                  'flex-none',
                  layout === 'rail' ? 'size-5' : 'size-5',
                )}
              />
              <span
                className={cn(
                  'font-bold tracking-[0.08em] uppercase',
                  layout === 'rail'
                    ? 'text-[9px] leading-none tracking-[0.04em]'
                    : 'flex-1 text-[13px] leading-none',
                )}
              >
                {name}
                {soon && (
                  <span className='ml-1.5 text-[10px] tracking-[0.1em] text-mb-mute'>
                    {common.soon}
                  </span>
                )}
              </span>
              <MbKbd
                className={
                  layout === 'rail'
                    ? 'absolute top-0.5 right-0.5 scale-[0.8]'
                    : ''
                }
              >
                {key}
              </MbKbd>
            </>
          );
          const base = cn(
            'mb-place relative flex cursor-pointer items-center text-mb-mute pointer-coarse:min-h-11',
            layout === 'rail'
              ? 'min-h-[52px] w-[68px] flex-col justify-center gap-1.5 px-0.5 py-1.5'
              : 'min-h-12 w-full gap-3 px-3',
          );
          return (
            <li key={page}>
              {soon ? (
                <span
                  className={cn(base, 'cursor-not-allowed opacity-60')}
                  aria-disabled='true'
                  data-soon=''
                >
                  {content}
                </span>
              ) : (
                <Link
                  href={PAGE_META[page].href}
                  aria-current={current === page ? 'page' : undefined}
                  aria-keyshortcuts={key}
                  data-here={current === page || undefined}
                  className={base}
                  onClick={(event) => {
                    // a plain click walks the champion to the place and opens it; a click with a modifier keeps the browser's own way
                    if (
                      event.metaKey ||
                      event.ctrlKey ||
                      event.shiftKey ||
                      event.altKey ||
                      event.button !== 0
                    )
                      return;
                    event.preventDefault();
                    goToPage(page);
                    onNavigate?.();
                  }}
                >
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

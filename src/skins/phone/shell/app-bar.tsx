/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { phoneCopy } from '@/content/copy/phone';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { PhAction } from '@/skins/phone/shell/ph-action';
import { useAppBarTitle } from '@/skins/phone/shell/title-context';
import { useBarHide } from '@/skins/phone/shell/use-bar-hide';

/**
 * The bar of an app under the status bar, a light glass (a veil of the page's colour at 88 to 92%, which reaches up to the top of the screen behind the status bar and goes with the bar when it slides, no blur, at every width) the page scrolls under (a hairline shows once something is under it) that slides away when
 * the page scrolls down and comes back when it scrolls up (`use-bar-hide.ts`): the way back to the home screen at the start, the small title in the middle once the large
 * one of the page has scrolled away (a repeat of the heading, so readers skip it), and Ask BB Bot, Connect and Download CV at the end (the
 * home screen has them in its dock). The bar is the SAME SIZE on the cover screen and on the inner one, and at every width, so that a fold does not make it jump: a row of 44 px, a pill of 36 px in a target of 44, round buttons of 36 px in targets of 44, the way back with its word, the title between them in the same
 * place; only the side padding differs (12 px, 24 px from 900 px), as that of the page does, so the bar keeps the same distance from the content in both.
 */
export function AppBar() {
  const copy = useCopy(phoneCopy);
  const { title, collapsed, scrolled, bar, barRef } = useAppBarTitle();
  useBarHide(bar);
  return (
    <div
      ref={barRef}
      data-ph-app-bar=''
      className={cn(
        // it follows the scroll with `--ph-bar-y` and `--ph-bar-o`, written by `use-bar-hide.ts`; the border is only toggled at the top of the page, so
        // that nothing but transform and opacity changes as it moves. Its veil (`.ph-bar-veil`, `phone.css`) is the same at every width: the page's
        // colour at about 90% across the row where the link, the title and the buttons are, so that nothing under them is legible, and a tail below
        // the bar that fades to nothing; no blur, which is also the dearest thing a scroll paints
        'sticky top-(--ph-bar-top) z-20 flex h-11 shrink-0 items-center justify-between border-b ph-bar-veil px-3 [transform:translate3d(0,var(--ph-bar-y,0px),0)] [will-change:transform,opacity] data-snap:transition-[transform,opacity] data-snap:duration-[180ms] data-snap:ease-ph-out @min-[900px]:px-6',
        scrolled
          ? 'border-ph-line group-data-[bar=hidden]/ph:border-transparent'
          : 'border-transparent',
      )}
    >
      <Link
        href='/'
        className='relative -ml-1 inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-0.5 rounded-full pr-3 pl-1 text-[16px] font-semibold text-ph-accent-ink no-underline transition-[scale] duration-100 before:absolute before:inset-1 before:rounded-full before:bg-ph-ink/8 before:transition-[background-color] before:duration-100 hover:before:bg-ph-ink/14 active:scale-[0.96] [opacity:var(--ph-bar-o,1)]'
      >
        <ChevronLeft
          aria-hidden='true'
          className='relative size-[22px]'
          strokeWidth={2.4}
        />
        <span className='relative'>{copy.backHome}</span>
      </Link>
      <p
        aria-hidden='true'
        data-ph-bar-title={collapsed ? 'shown' : 'hidden'}
        // it comes in as the large title goes (`--ph-large-r` is how much of that is left under the bar): it is not there at all while the large title is
        className='pointer-events-none absolute right-36 left-32 truncate text-center text-[15px] font-semibold [opacity:calc(clamp(0,calc((0.5-var(--ph-large-r,1))*3),1)*var(--ph-bar-o,1))]'
      >
        {title}
      </p>
      <div className='flex shrink-0 items-center [opacity:var(--ph-bar-o,1)]'>
        <PhAction kind='chat' layout='icon' />
        <PhAction kind='connect' layout='icon' />
        <PhAction kind='cv' layout='icon' />
      </div>
    </div>
  );
}

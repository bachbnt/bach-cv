/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { DocumentTitle } from '@/components/document-title';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { useLargeTitle } from '@/skins/phone/shell/title-context';
import { PhStatusScreen } from '@/skins/phone/ui/ph-status-screen';

/**
 * The screen of an app: the tab title and the `site/live` page switch (`soon` shows Coming soon, `hidden` the 404; it fails open while the
 * switches load), then a `main` with the large title of the app and the line under it. The app bar shows the title again, small, once the
 * large one has scrolled away. `wide` lets a page use the whole width of a tablet. The padding is the same on both sides in every mode: where the device is open, a page that has two panes lays them out with `--ph-pane-left` and
 * `--ph-pane-gap` (`phone-shell.tsx`), which put the crease in the gap between them.
 */
export function PhPage({
  page,
  title,
  lead,
  wide = false,
  children,
}: {
  page: PageKey;
  /** the large title; it is the one `h1` of the page */
  title: string;
  lead?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  const state = useLive().pages[page];
  const { ref: headingRef } = useLargeTitle(title);
  return (
    <>
      <DocumentTitle page={page} />
      {state === 'soon' ? (
        <PhStatusScreen variant='soon' />
      ) : state === 'hidden' ? (
        <PhStatusScreen variant='notFound' />
      ) : (
        <main
          id='ph-main'
          tabIndex={-1}
          className={cn(
            'mx-auto w-full px-5 pt-2 pb-[calc(3rem+env(safe-area-inset-bottom,0px))] outline-none @min-[900px]:px-8',
            wide ? 'max-w-[1080px]' : 'max-w-[820px]',
            // an open device has no cap: its panes fill the area between the rail and the margin
            'group-data-[hinge]/ph:@min-[900px]:max-w-none',
          )}
        >
          <h1
            ref={headingRef}
            className='text-[34px]/[1.1] font-extrabold tracking-[-0.02em] @min-[900px]:text-[40px]'
          >
            {title}
          </h1>
          {lead && (
            <p
              data-ph-lead=''
              className='mt-2 max-w-[60ch] text-[16px]/[1.5] text-ph-mute'
            >
              {lead}
            </p>
          )}
          <div className='mt-6'>{children}</div>
        </main>
      )}
    </>
  );
}

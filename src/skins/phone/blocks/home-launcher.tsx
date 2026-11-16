/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { phoneHomeCopy } from '@/content/copy/phone-home';
import { useLive } from '@/hooks/use-live';
import { shownPages } from '@/lib/derive/shown-pages';
import { useCopy } from '@/lib/i18n/copy';
import { HomeApp } from '@/skins/phone/blocks/home-app';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import { PhAction } from '@/skins/phone/shell/ph-action';

/**
 * The launcher: the grid of the pages that are shown (a page that is `hidden` is not there, one that is `soon` is not a link) and under it
 * the dock with the four things that are not pages. There is no app for Home: this is the home screen.
 */
export function HomeLauncher() {
  const copy = useCopy(phoneHomeCopy).home;
  const live = useLive();
  const apps = shownPages(live.pages).filter((page) => page !== 'home');
  return (
    <div className='flex flex-col gap-4'>
      {apps.length > 0 && (
        <HomeGlass as='section' className='px-3 py-4'>
          <h2 className='sr-only'>{copy.apps}</h2>
          <ul className='m-0 grid list-none grid-cols-3 gap-x-1 gap-y-3.5 p-0'>
            {apps.map((page) => (
              <li key={page} className='flex min-w-0 justify-center'>
                <HomeApp page={page} soon={live.pages[page] === 'soon'} />
              </li>
            ))}
          </ul>
        </HomeGlass>
      )}
      <HomeGlass className='flex justify-between gap-1 px-3 py-2.5'>
        {(['chat', 'connect', 'cv', 'settings'] as const).map((kind) => (
          <PhAction
            key={kind}
            kind={kind}
            layout='dock'
            className='w-auto min-w-0 flex-1 text-ph-ink'
          />
        ))}
      </HomeGlass>
    </div>
  );
}

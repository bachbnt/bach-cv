/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { DocumentTitle } from '@/components/document-title';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';
import { HomeBuild } from '@/skins/phone/blocks/home-build';
import { HomeContact } from '@/skins/phone/blocks/home-contact';
import { HomeHero } from '@/skins/phone/blocks/home-hero';
import { HomeIntro } from '@/skins/phone/blocks/home-intro';
import { HomeLauncher } from '@/skins/phone/blocks/home-launcher';
import { HomeNow } from '@/skins/phone/blocks/home-now';
import { HomePipeline } from '@/skins/phone/blocks/home-pipeline';
import { HomePlatforms } from '@/skins/phone/blocks/home-platforms';
import { HomeProjects } from '@/skins/phone/blocks/home-projects';
import { HomeSkills } from '@/skins/phone/blocks/home-skills';
import { HomeWork } from '@/skins/phone/blocks/home-work';
import { HomeYears } from '@/skins/phone/blocks/home-years';
import { PhStatusScreen } from '@/skins/phone/ui/ph-status-screen';

/**
 * Home is the home screen: the greeting, the widgets made of the real data, the grid of apps and the dock, and under them, on the same
 * scrolling screen, the rest of what Standard's Home tells (the feed of cards). On a tablet the launcher stays at the right (on an open device the two columns are equal, so that none lies across the crease) while the
 * widgets and the feed scroll at the left; on a phone it is one column, and the first screen ends with the dock.
 */
export function HomePage() {
  const copy = useCopy(phoneHomeCopy).home;
  const state = useLive().pages.home;

  if (state === 'soon' || state === 'hidden')
    return (
      <>
        <DocumentTitle page='home' />
        <PhStatusScreen variant={state === 'soon' ? 'soon' : 'notFound'} />
      </>
    );

  return (
    <>
      <DocumentTitle page='home' />
      <main
        id='ph-main'
        tabIndex={-1}
        className='mx-auto w-full max-w-[640px] px-5 pt-2 pb-10 outline-none @min-[900px]:max-w-[1120px] @min-[900px]:px-8'
      >
        <div
          className={cn(
            'grid gap-x-8 gap-y-5 @min-[900px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @min-[900px]:items-start',
            HINGE_PANES,
          )}
        >
          <div className='flex min-w-0 flex-col gap-4 @min-[900px]:col-start-1 @min-[900px]:row-start-1'>
            <HomeHero />
            <HomeNow />
            <div className='grid auto-rows-fr grid-cols-1 items-stretch gap-4 @min-[380px]:grid-cols-2 @min-[380px]:[&>*:only-child]:col-span-2'>
              <HomeYears />
              <HomePlatforms />
            </div>
          </div>
          <div className='flex min-w-0 flex-col gap-4 @min-[900px]:sticky @min-[900px]:top-[calc(var(--ph-bar-shown)+0.5rem)] @min-[900px]:col-start-2 @min-[900px]:row-span-2 @min-[900px]:row-start-1'>
            <HomeLauncher />
            <h2 className='sr-only'>{copy.feed}</h2>
            <HomeIntro />
          </div>
          <div className='flex min-w-0 flex-col gap-4 @min-[900px]:col-start-1 @min-[900px]:row-start-2'>
            <HomeSkills />
            <HomePipeline />
            <HomeWork />
            <HomeBuild />
            <HomeProjects />
            <HomeContact />
          </div>
        </div>
      </main>
    </>
  );
}

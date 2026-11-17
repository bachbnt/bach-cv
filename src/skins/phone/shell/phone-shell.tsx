/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState, ViewTransition, type ReactNode } from 'react';
import type { PageKey } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { AppWindow } from '@/skins/phone/shell/app-window';
import { HomeBar } from '@/skins/phone/shell/home-bar';
import { PhFoldGuard } from '@/skins/phone/shell/ph-fold-guard';
import { PhOverlayProvider } from '@/skins/phone/shell/overlay-context';
import { PhOverlays } from '@/skins/phone/shell/overlays';
import { PhDeviceBody } from '@/skins/phone/shell/ph-device-body';
import { PhDeviceDetails } from '@/skins/phone/shell/ph-device-details';
import { PhDeviceKeys } from '@/skins/phone/shell/ph-device-keys';
import { PhLockScreen } from '@/skins/phone/shell/ph-lock-screen';
import { PhPowerGuard } from '@/skins/phone/shell/ph-power-guard';
import { PhScreenDim } from '@/skins/phone/shell/ph-screen-dim';
import { PhScreenOff } from '@/skins/phone/shell/ph-screen-off';
import { PhVolumeHud } from '@/skins/phone/shell/ph-volume-hud';
import { PhFoldControl } from '@/skins/phone/shell/ph-fold-control';
import { PhToast } from '@/skins/phone/shell/ph-toast';
import { PhScreenProvider } from '@/skins/phone/shell/screen-context';
import { StatusBar } from '@/skins/phone/shell/status-bar';
import { PhTitleProvider } from '@/skins/phone/shell/title-context';
import { useBack } from '@/skins/phone/shell/use-back';
import { useEdgeSwipe } from '@/skins/phone/shell/use-edge-swipe';
import { useDeviceScale } from '@/skins/phone/shell/use-device-scale';
import { useFold } from '@/skins/phone/shell/use-fold';
import { useFoldKey } from '@/skins/phone/shell/use-fold-key';
import { useScreenPower } from '@/skins/phone/shell/use-screen-power';
import { useScrollCue } from '@/skins/phone/shell/use-scroll-cue';
import { useVtClip } from '@/skins/phone/shell/use-vt-clip';
import { useWindowMode } from '@/skins/phone/shell/use-window-mode';
import { PhAppFrame } from '@/skins/phone/ui/ph-app-morph';
import { PhRoot } from '@/skins/phone/ui/ph-root';

/**
 * The frame of the Phone skin. In a large window (1100 x 600 and up) the screen is the display of a foldable device in the middle of it,
 * folded (the cover screen, the phone layout) or open (the inner screen, the tablet layout and a crease down the middle); in any other
 * window the screen is the window, and a tablet or a landscape phone gets the tablet layout from 900 px of width. The layout always
 * follows the width of the SCREEN (container queries on it), never the window.
 *
 * The screen is the status bar, the page and, in an app, the home bar. Where the screen has a size of its own (the device, a tablet
 * layout) the page scrolls inside it under the bars; on a phone the document scrolls, under bars that stick. Sheets, popovers, the
 * viewer and the toast are put in a layer over the screen that is as big as the screen. The home screen (the Home page) lies on the
 * wallpaper; every other page is an app on its own surface, with the way back in its bar, and grows out of its icon.
 */
export function PhoneShell({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  const home = page === 'home';
  const mode = useWindowMode();
  const device = mode === 'device';
  const [display, setDisplay] = useState<HTMLElement | null>(null);
  const [stage, setStage] = useState<HTMLElement | null>(null);
  useDeviceScale(stage, device);
  const fold = useFold(mode, display);
  const folded = fold.target === 'folded';
  const hinge = device && fold.drawn === 'open';
  // the screen of the device is off or on its lock screen: what is in it cannot be reached (the power button, `use-screen-power.ts`)
  const dark = useScreenPower() !== 'on' && device;
  const back = useBack(page);
  // the layer over the screen is where the sheets, the popovers and the viewer are put; the screen is where the gestures are caught
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  const [screen, setScreen] = useState<HTMLElement | null>(null);
  const [scrolling, setScrolling] = useState<HTMLElement | null>(null);
  // a new page starts at its top, in the scroller of the device and in the window of a phone
  useEffect(() => {
    // a page that was opened at an anchor (`/resume#skills`) has already been scrolled to it by its own effect, which runs before this one
    if (window.location.hash) return;
    scrolling?.scrollTo(0, 0);
    window.scrollTo(0, 0);
    // only a new page goes back to the top; the scroller exists from the first render on
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);
  useScrollCue();
  useVtClip(display, device, fold.phase === 'idle');
  useFoldKey(device, () => fold.set(folded ? 'open' : 'folded'));
  useEdgeSwipe(screen, home ? null : back);

  const toggleFold = () => fold.set(folded ? 'open' : 'folded');
  const hingeAttribute = hinge ? '' : undefined;

  return (
    <PhOverlayProvider>
      <PhScreenProvider root={layer} scroller={scrolling}>
        <PhTitleProvider>
          <PhRoot
            data-mode={mode}
            className={cn(
              device &&
                // `overflow-clip`, not `hidden`: a hidden box can still be scrolled by a focus or a scrollIntoView inside it, which pushes the
                // whole device (and the Fold button) up out of the window
                'ph-backdrop relative flex h-dvh min-h-0 items-center justify-center overflow-clip',
            )}
          >
            {device && <PhFoldControl folded={folded} onToggle={toggleFold} />}
            <div ref={setStage} className='ph-stage' data-mode={mode}>
              <div
                className='ph-rig'
                data-mode={mode}
                data-fold={fold.drawn}
                data-phase={fold.phase}
                onAnimationEnd={(event) => fold.end(event.animationName)}
              >
                {device && <PhDeviceBody />}
                {device && <PhDeviceKeys />}
                <div ref={setDisplay} className='ph-display'>
                  <div
                    ref={setScreen}
                    inert={dark}
                    data-ph-screen=''
                    data-mode={mode}
                    data-hinge={hingeAttribute}
                    className={cn(
                      '@container group/ph relative isolate flex w-full flex-col overflow-clip data-[mode=device]:size-full data-[mode=full-bleed]:min-h-dvh',
                      home ? 'ph-wallpaper text-ph-glass-ink' : 'bg-ph-sheet',
                    )}
                  >
                    {!home && page && <PhAppFrame page={page} />}
                    <div
                      data-ph-body=''
                      className={cn(
                        // the status bar and the app bar lie over the page, which scrolls under them: `--ph-bar-top` is where the app bar starts
                        // (the height of the status bar) and `--ph-bars` where the first content starts, which is also what an anchor has to clear
                        'flex min-h-0 flex-1 flex-col [--ph-bar-top:calc(2.5rem+env(safe-area-inset-top,0px))] group-data-[bar=hidden]/ph:[--ph-bar-shown:var(--ph-bar-top)] [--ph-home-bar:calc(2.25rem+env(safe-area-inset-bottom,0px))] group-data-[hinge]/ph:[--ph-pane-gap:1.5rem] group-data-[hinge]/ph:[--ph-pane-left:calc(50cqw-var(--ph-rail)-2rem-var(--ph-pane-gap)/2)] group-data-[mode=full-bleed]/ph:@min-[900px]:max-h-dvh',
                        home
                          ? '[--ph-bars:calc(2.5rem+env(safe-area-inset-top,0px))] [--ph-bar-shown:var(--ph-bars)] [--ph-rail:0px]'
                          : '[--ph-bars:calc(5.25rem+env(safe-area-inset-top,0px))] [--ph-bar-shown:var(--ph-bars)] [--ph-rail:88px]',
                      )}
                    >
                      <StatusBar onWallpaper={home} />
                      <div
                        ref={setScrolling}
                        className='flex min-h-0 flex-1 flex-col scroll-pt-(--ph-bars) scroll-pb-(--ph-home-bar) group-data-[mode=device]/ph:overflow-y-auto group-data-[mode=device]/ph:overscroll-contain @min-[900px]:overflow-y-auto @min-[900px]:overscroll-contain'
                      >
                        {home ? (
                          <ViewTransition
                            key='home'
                            enter='ph-vt-return'
                            exit='ph-vt-recede'
                            default='none'
                          >
                            <div className='flex flex-1 flex-col pt-(--ph-bar-top)'>
                              {children}
                            </div>
                          </ViewTransition>
                        ) : (
                          <ViewTransition
                            key={page ?? 'none'}
                            enter='ph-vt-app-in'
                            exit='ph-vt-app-out'
                            default='none'
                          >
                            <div className='flex flex-1 flex-col'>
                              <AppWindow page={page}>{children}</AppWindow>
                            </div>
                          </ViewTransition>
                        )}
                      </div>
                      {!home && <HomeBar />}
                    </div>
                  </div>
                  {/* the layer: the sheets and the popovers, as big as the screen and in front of it (the toast is in front of that) */}
                  <div
                    ref={setLayer}
                    inert={dark}
                    data-mode={mode}
                    data-hinge={hingeAttribute}
                    className='@container group/ph pointer-events-none z-50 contain-layout *:pointer-events-auto data-[mode=device]:absolute data-[mode=device]:inset-0 data-[mode=full-bleed]:fixed data-[mode=full-bleed]:inset-0'
                  />
                  {/* the banner of a toast: under the camera, in front of the layer */}
                  <PhToast hinge={hinge} />
                  {/* the hardware of the display: the black glass of a screen that is off, the lock screen, the volume HUD (all of them above the page) */}
                  {device && (
                    <>
                      <PhScreenOff />
                      <PhLockScreen />
                      <PhVolumeHud />
                      <PhScreenDim />
                    </>
                  )}
                </div>
                {device && (
                  <PhDeviceDetails
                    fold={fold.target}
                    hinge={hinge && fold.phase === 'idle'}
                    onFold={fold.set}
                  />
                )}
              </div>
            </div>
            <PhOverlays />
            {device && <PhFoldGuard target={fold.target} />}
            {device && <PhPowerGuard />}
          </PhRoot>
        </PhTitleProvider>
      </PhScreenProvider>
    </PhOverlayProvider>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLatest } from '@/hooks/use-latest';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import type { PageKey } from '@/lib/content/schema';
import {
  clampInside,
  crossOpacity,
  FADE_MS,
  RECEDE,
  relativeTo,
  ZOOM_EASING,
  ZOOM_MS,
  zoomPlan,
  type Box,
  type Corners,
} from '@/skins/phone/shell/app-zoom';
import {
  armAppClose,
  armAppOpen,
  dropIntent,
  registerZoomScreen,
  takeIntent,
  windowOf,
  type Intent,
  type ZoomScreen,
} from '@/skins/phone/shell/app-zoom-intent';

/** what is playing, so that a new page change can put an end to it at once */
interface Run {
  end: () => void;
}

const timing = {
  duration: ZOOM_MS,
  easing: ZOOM_EASING,
  fill: 'both',
} as const;
const linear = { duration: ZOOM_MS, easing: 'linear', fill: 'both' } as const;

/** The four corners of an element, in px of the layout. */
const cornersOf = (element: Element): Corners => {
  const style = getComputedStyle(element);
  const px = (value: string) => parseFloat(value) || 0;
  return [
    px(style.borderTopLeftRadius),
    px(style.borderTopRightRadius),
    px(style.borderBottomRightRadius),
    px(style.borderBottomLeftRadius),
  ];
};

/**
 * An app OPENS by zooming out of its icon and CLOSES by zooming back into it, and every other change of page is a short fade. The icon is where the visitor
 * clicked (`app-zoom-intent.ts`, heard in the capture phase before the router does anything, which also makes a picture of the screen, because what is left is gone
 * when the next page is there). When the page has changed, this puts the new page at its FINAL size, not seen, and in the passive effect (which runs after the effects of the
 * page, so that what they measure is measured at the real size) plays, by the Web Animations API and on the real elements: the page is scaled and cut to a box that grows from the icon to the
 * window (`zoomPlan`: the same easing and the same two ends for the box and for the scale, so nothing is stretched), its corners grow from the icon's to the display's, the icon
 * becomes the app in the first third, and the home screen, as a picture behind it, recedes. Closing is the same the other way: the picture of the app shrinks into the icon that the home
 * screen has by then, and the home screen returns. Nothing is ever drawn outside the window (the box is inside it, and a box is cut by `clip-path`), the status bar, the camera and the
 * home bar stay where they are, a new page change ends a zoom at once (nothing is left half way), and the focus ends in the page (or on the icon that was closed into).
 * Reduced motion has the fade only.
 */
export function useAppZoom({
  page,
  screen,
  scroller,
  device,
}: {
  page: PageKey | null;
  screen: HTMLElement | null;
  scroller: HTMLElement | null;
  device: boolean;
}) {
  const reduced = useReducedMotion();
  const current = useLatest(page);
  const previous = useRef<PageKey | null | undefined>(undefined);
  const playing = useRef<Run | null>(null);
  const start = useRef<(() => void) | null>(null);

  // what is heard before the page changes: a click on a tile, a link to the home screen, the back button of the browser
  useEffect(() => {
    if (!screen || !scroller) return;
    registerZoomScreen({
      screen,
      scroller,
      device,
      page: () => current.current,
    });
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element | null)?.closest?.('a');
      if (!link) return;
      const tile = link.closest<HTMLElement>('[data-ph-app]');
      if (tile) armAppOpen(tile, tile.dataset.phApp as PageKey);
      else if (link.getAttribute('href') === '/') armAppClose();
    };
    // the back and forward buttons: the router has changed the page by the time `popstate` is heard, so a browser that has the Navigation API is asked at its `navigate`
    // event, which comes before (the other browsers get `popstate`, and a way back that has armed the intent already is not armed twice)
    const onTraverse = (event: Event) => {
      if (
        (event as Event & { navigationType?: string }).navigationType ===
        'traverse'
      )
        armAppClose();
    };
    const navigation = (window as Window & { navigation?: EventTarget })
      .navigation;
    const onPopState = () => armAppClose();
    document.addEventListener('click', onClick, true);
    navigation?.addEventListener('navigate', onTraverse);
    window.addEventListener('popstate', onPopState, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      navigation?.removeEventListener('navigate', onTraverse);
      window.removeEventListener('popstate', onPopState, true);
      registerZoomScreen(null);
    };
  }, [screen, scroller, device, current]);

  // the page has changed: put an end to what played, and make ready (before the first frame is painted: the new page is not seen until it starts)
  useLayoutEffect(() => {
    const was = previous.current;
    previous.current = page;
    if (was === undefined || was === page || !screen || !scroller) return;
    playing.current?.end();
    playing.current = null;
    const content = scroller.querySelector<HTMLElement>(
      ':scope > [data-ph-zoom-content]',
    );
    const kind =
      page && page !== 'home' && was === 'home'
        ? 'open'
        : page === 'home' && was && was !== 'home'
          ? 'close'
          : null;
    const taken =
      kind === 'open' && page
        ? takeIntent('open', page)
        : kind === 'close' && was
          ? takeIntent('close', was)
          : (dropIntent(), null);
    if (!content) {
      taken?.layer.remove();
      return;
    }
    // a visitor who asked for less motion gets the fade only
    const intent = reduced ? (taken?.layer.remove(), null) : taken;
    content.style.opacity = '0';
    if (!device) window.scrollTo(0, 0);
    if (intent) {
      intent.layer.style.removeProperty('visibility');
      screen.setAttribute('data-ph-zoom', intent.kind);
    }
    const zoom: ZoomScreen = {
      screen,
      scroller,
      device,
      page: () => page,
    };
    start.current = () => {
      const run = intent
        ? intent.kind === 'open'
          ? zoomOpen(zoom, content, intent)
          : zoomClose(zoom, content, intent)
        : fade(zoom, content);
      playing.current = run;
    };
  }, [page, screen, scroller, device, reduced]);

  // the effects of the new page have run (they come before this one): it can start
  useEffect(() => {
    const go = start.current;
    start.current = null;
    go?.();
  }, [page]);

  // the skin goes away: nothing is left of a zoom
  useEffect(
    () => () => {
      playing.current?.end();
      playing.current = null;
    },
    [],
  );
}

/** Makes a run of animations that ends all together: when they have finished, or when it is told to. */
function runOf(
  zoom: ZoomScreen,
  animations: Animation[],
  after: () => void,
): Run {
  let over = false;
  const end = () => {
    if (over) return;
    over = true;
    for (const animation of animations) animation.cancel();
    after();
    zoom.screen.removeAttribute('data-ph-zoom');
    // what watches the geometry of the page (the large title) has been told nothing while it was scaled
    zoom.screen.dispatchEvent(new Event('ph-zoom-end'));
  };
  void Promise.allSettled(
    animations.map((animation) => animation.finished),
  ).then(end);
  return { end };
}

/** Whether the focus is somewhere that is not the page any more (the link that was clicked is gone). */
const lost = (zoom: ZoomScreen) =>
  !document.activeElement ||
  document.activeElement === document.body ||
  !zoom.screen.contains(document.activeElement) ||
  document.activeElement.closest('[data-ph-ghost]') !== null;

/** An app opens: the page zooms out of the icon over the picture of the home screen. */
function zoomOpen(
  zoom: ZoomScreen,
  content: HTMLElement,
  intent: Extract<Intent, { kind: 'open' }>,
): Run {
  const { scroller } = zoom;
  const win = windowOf(zoom);
  const view: Box = {
    x: 0,
    y: 0,
    width: win.box.width / win.scale,
    height: win.box.height / win.scale,
  };
  const display = scroller.closest('.ph-display');
  const plan = zoomPlan({
    icon: clampInside(relativeTo(intent.icon, win.box, win.scale), view),
    view,
    size: { width: scroller.offsetWidth, height: scroller.offsetHeight },
    iconCorners: [intent.radius, intent.radius, intent.radius, intent.radius],
    viewCorners: zoom.device && display ? cornersOf(display) : [0, 0, 0, 0],
  });
  content.style.transformOrigin = '0 0';
  const homeBar = zoom.screen.querySelector('[data-ph-home-bar]');
  const animations = [
    scroller.animate({ clipPath: plan.clip }, timing),
    content.animate({ transform: plan.content }, timing),
    content.animate(crossOpacity('open'), linear),
    intent.layer.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: `scale(${RECEDE.scale})`, opacity: RECEDE.opacity },
      ],
      timing,
    ),
    ...(homeBar
      ? [
          homeBar.animate(
            [
              { opacity: 0, offset: 0 },
              { opacity: 0, offset: 0.6 },
              { opacity: 1, offset: 1 },
            ],
            linear,
          ),
        ]
      : []),
  ];
  return runOf(zoom, animations, () => {
    intent.layer.remove();
    content.style.opacity = '';
    content.style.transformOrigin = '';
    if (lost(zoom)) {
      const heading = content.querySelector<HTMLElement>('h1');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
    }
  });
}

/** An app closes: the picture of the page shrinks into the icon, and the home screen returns. */
function zoomClose(
  zoom: ZoomScreen,
  content: HTMLElement,
  intent: Extract<Intent, { kind: 'close' }>,
): Run {
  const { scroller } = zoom;
  const win = windowOf(zoom);
  const view: Box = {
    x: 0,
    y: 0,
    width: win.box.width / win.scale,
    height: win.box.height / win.scale,
  };
  const link = scroller.querySelector<HTMLElement>(
    `[data-ph-app="${intent.page}"]`,
  );
  const tile = link?.firstElementChild;
  const frame = intent.layer.firstElementChild as HTMLElement | null;
  const display = scroller.closest('.ph-display');
  const viewCorners: Corners =
    zoom.device && display ? cornersOf(display) : [0, 0, 0, 0];
  // the icon is measured BEFORE the home screen is made smaller (it is where the icon will be when the home screen has come back)
  const rect = tile?.getBoundingClientRect();
  content.style.transformOrigin = '50% 50%';
  const animations: Animation[] = [
    content.animate(
      [
        { transform: `scale(${RECEDE.scale})`, opacity: RECEDE.opacity },
        { transform: 'scale(1)', opacity: 1 },
      ],
      timing,
    ),
  ];
  if (rect && frame) {
    const icon = clampInside(
      relativeTo(
        { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        win.box,
        win.scale,
      ),
      view,
    );
    const radius = icon.width * 0.3;
    const plan = zoomPlan({
      icon,
      view,
      size: { width: view.width, height: view.height },
      iconCorners: [radius, radius, radius, radius],
      viewCorners,
    });
    frame.style.transformOrigin = '0 0';
    animations.push(
      intent.layer.animate({ clipPath: [...plan.clip].reverse() }, timing),
      frame.animate({ transform: [...plan.content].reverse() }, timing),
      intent.layer.animate(crossOpacity('close'), linear),
    );
  } else {
    // an app that has no icon on the home screen (it is hidden, or it is not there yet): the picture only fades away
    animations.push(
      intent.layer.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: FADE_MS,
        easing: 'linear',
        fill: 'both',
      }),
    );
  }
  return runOf(zoom, animations, () => {
    intent.layer.remove();
    content.style.opacity = '';
    content.style.transformOrigin = '';
    if (lost(zoom)) link?.focus({ preventScroll: true });
  });
}

/** Any other change of page (the rail, an address, a visitor who asked for less motion): the page fades in, over a short time. */
function fade(zoom: ZoomScreen, content: HTMLElement): Run {
  const animation = content.animate([{ opacity: 0 }, { opacity: 1 }], {
    duration: FADE_MS,
    easing: 'linear',
    fill: 'both',
  });
  return runOf(zoom, [animation], () => {
    content.style.opacity = '';
  });
}

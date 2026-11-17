/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { PageKey } from '@/lib/content/schema';
import { INTENT_MS, type Box } from '@/skins/phone/shell/app-zoom';

/*
 * What the zoom of an app has to know before the page changes, and cannot find out afterwards: where the icon was (the tile is gone when the app is there) and what the
 * screen looked like (the page that is left is gone when the next one is there). The click on a tile, a way back and the back button of the browser are heard in the
 * capture phase, before the router has done anything, and a PICTURE of the screen is made then: a copy of its page in a layer that is hidden from readers and from
 * the pointer (`ph-zoom-layer`). `useAppZoom` takes the intent when the page has changed, plays the zoom, and removes the picture. An intent that nobody takes goes stale.
 */

/** where the screen is and what it is made of, put here by `useAppZoom` */
export interface ZoomScreen {
  screen: HTMLElement;
  scroller: HTMLElement;
  /** a device: the window of the zoom is the screen, drawn at a scale; otherwise it is the viewport of the browser */
  device: boolean;
  /** the page that is on screen now */
  page: () => PageKey | null;
}

export type Intent =
  | {
      kind: 'open';
      page: PageKey;
      icon: Box;
      radius: number;
      layer: HTMLElement;
      at: number;
    }
  | { kind: 'close'; page: PageKey; layer: HTMLElement; at: number };

let screen: ZoomScreen | null = null;
let pending: Intent | null = null;

export function registerZoomScreen(value: ZoomScreen | null) {
  screen = value;
  if (!value) dropIntent();
}

/** Throws the intent away with its picture. */
export function dropIntent() {
  pending?.layer.remove();
  pending = null;
}

/** The variables of the body of the screen that the pages read: a copy of a page does not sit in the body any more, so it takes them with it. */
const BODY_VARIABLES = [
  '--ph-bar-top',
  '--ph-bars',
  '--ph-bar-shown',
  '--ph-home-bar',
  '--ph-rail',
  '--ph-pane-gap',
  '--ph-pane-left',
];

/** What the window of the zoom is: the screen of a device, the viewport of a window; and the scale the device is drawn at. */
export function windowOf(zoom: ZoomScreen): { box: Box; scale: number } {
  const rect = zoom.scroller.getBoundingClientRect();
  if (zoom.device)
    return {
      box: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
      scale: zoom.scroller.offsetWidth
        ? rect.width / zoom.scroller.offsetWidth
        : 1,
    };
  return {
    box: { x: 0, y: 0, width: innerWidth, height: innerHeight },
    scale: 1,
  };
}

/** A picture of the page that is on screen: a copy of the scroller in a layer of the size of the window, which has the ground of the screen. */
function snapshot(zoom: ZoomScreen, zIndex: number): HTMLElement {
  const { screen: root, scroller } = zoom;
  const layer = document.createElement('div');
  layer.className = `ph-zoom-layer ${
    root.classList.contains('ph-wallpaper')
      ? 'ph-wallpaper text-ph-glass-ink'
      : 'bg-ph-sheet'
  }`;
  layer.setAttribute('aria-hidden', 'true');
  layer.inert = true;
  layer.dataset.phGhost = '';
  layer.style.zIndex = String(zIndex);
  const body = root.querySelector('[data-ph-body]');
  if (body) {
    const style = getComputedStyle(body);
    for (const name of BODY_VARIABLES)
      layer.style.setProperty(name, style.getPropertyValue(name));
  }
  const win = windowOf(zoom);
  const rect = scroller.getBoundingClientRect();
  // the frame is the window, which is what the zoom scales; the page is in it, as far up as the document has been scrolled (a window of a phone scrolls the document)
  const frame = document.createElement('div');
  frame.className = 'ph-zoom-frame';
  const inner = document.createElement('div');
  inner.className = 'ph-zoom-page';
  inner.style.top = `${(rect.top - win.box.y) / win.scale}px`;
  inner.style.width = `${scroller.offsetWidth}px`;
  inner.style.height = `${scroller.offsetHeight}px`;
  const copy = scroller.cloneNode(true) as HTMLElement;
  // a copy is a picture: no name that a query or a style could take for the page's own, and nothing that could take the focus
  for (const element of [copy, ...copy.querySelectorAll<HTMLElement>('*')]) {
    element.removeAttribute('id');
    for (const name of element.getAttributeNames())
      if (name.startsWith('data-ph-')) element.removeAttribute(name);
  }
  inner.append(copy);
  frame.append(inner);
  layer.append(frame);
  // it is put in its place at once, but not seen (a copy that is taken out of the document loses its scroll): the zoom shows it when the page has changed
  layer.style.visibility = 'hidden';
  zoom.screen.querySelector('[data-ph-zoom-host]')?.append(layer);
  copy.scrollTop = scroller.scrollTop;
  return layer;
}

/** The picture of the home screen lies behind the page that zooms (and above the ground of the screen); the picture of an app lies in front of the home screen and behind the status bar. */
const BEHIND = -10;
const IN_FRONT = 5;

/** An intent that nobody takes is thrown away with its picture, so that a copy of a page does not stay in the document. */
const expireLater = () => {
  const mine = pending;
  setTimeout(() => {
    if (pending && pending === mine) dropIntent();
  }, INTENT_MS + 100);
};

const fresh = (intent: Intent | null) =>
  intent !== null && performance.now() - intent.at < INTENT_MS;

/** A click on the tile of an app on the home screen: where the icon is, and a picture of the home screen. */
export function armAppOpen(link: HTMLElement, page: PageKey) {
  const zoom = screen;
  if (!zoom || zoom.page() !== 'home') return;
  const tile = link.firstElementChild as HTMLElement | null;
  if (!tile) return;
  dropIntent();
  const rect = tile.getBoundingClientRect();
  pending = {
    kind: 'open',
    page,
    icon: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
    // the tile is a squircle of 30% (`PhIconTile`)
    radius: rect.width * 0.3,
    layer: snapshot(zoom, BEHIND),
    at: performance.now(),
  };
  expireLater();
}

/** A way back to the home screen (a link to it, the home bar, a swipe, the button of the browser): a picture of the app that is on screen. */
export function armAppClose() {
  const zoom = screen;
  const page = zoom?.page();
  if (!zoom || !page || page === 'home') return;
  dropIntent();
  pending = {
    kind: 'close',
    page,
    layer: snapshot(zoom, IN_FRONT),
    at: performance.now(),
  };
  expireLater();
}

/** The intent for a page change, if there is one that fits and is fresh; the intent is used up either way. */
export function takeIntent(kind: Intent['kind'], page: PageKey): Intent | null {
  const intent = pending;
  pending = null;
  if (!intent) return null;
  if (!fresh(intent) || intent.kind !== kind || intent.page !== page) {
    intent.layer.remove();
    return null;
  }
  return intent;
}

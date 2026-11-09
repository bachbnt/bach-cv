/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
} from 'react';
import type { PageKey } from '@/lib/content/schema';
import { pageOfPath } from '@/lib/pages';
import {
  hazeMask,
  maskOrigin,
  newBoardMask,
  oldBoardMask,
  WIPE,
  wipeFrame,
  wipeGeometry,
  type BoardMask,
} from '@/skins/academic/shell/wipe-geometry';

/** How long a copy of the old page waits for the page change it was taken for. */
const STALE_MS = 1500;

/** What was on screen when the visitor asked for another page: a copy of the old page and where it was. */
interface Capture {
  ghost: HTMLElement;
  host: HTMLElement;
  rect: DOMRect;
}

interface Job {
  raf: number;
  ghost: HTMLElement;
  page: HTMLElement;
}

/** Takes the copy of the old page. It is called by whatever starts a page change (the tabs and links are found by the hook itself, the arrow keys call this). */
export const WipeCaptureContext = createContext<() => void>(() => undefined);
export const useWipeCapture = () => useContext(WipeCaptureContext);

const MASK_PROPERTIES = [
  'mask-image',
  '-webkit-mask-image',
  'mask-composite',
  '-webkit-mask-composite',
];

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Writes a mask on an element (both spellings: the prefixed one is the one older browsers know). */
function applyMask(element: HTMLElement, mask: BoardMask) {
  const images = mask.layers.join(',');
  const intersect = mask.composite === 'intersect';
  element.style.setProperty('mask-image', images);
  element.style.setProperty('-webkit-mask-image', images);
  element.style.setProperty('mask-composite', intersect ? 'intersect' : 'add');
  element.style.setProperty(
    '-webkit-mask-composite',
    intersect ? 'source-in' : 'source-over',
  );
}

/**
 * An eraser wipes the old page off the board and the new one shows behind it (`wipe-geometry.ts` has the maths).
 *
 * The page change is rendered by Next, so by then the old page is gone: a copy of it is taken when the visitor asks for another page (a click on a
 * link of the skin, or `capture()` for the arrow keys) and laid over the board, fixed where it was. The real new page is already in place; both are
 * masked by two gradients that the eraser moves. A browser back or forward button, a link that is not a page and a jump to an anchor take no copy,
 * so they have no wipe (the frame fades them). Reduced motion has no wipe at all.
 */
export function useEraserWipe(
  page: PageKey,
  pageRef: RefObject<HTMLElement | null>,
  overlayRef: RefObject<HTMLElement | null>,
): () => void {
  const captured = useRef<Capture | null>(null);
  const job = useRef<Job | null>(null);
  const stale = useRef<number | undefined>(undefined);
  const current = useRef(page);
  useEffect(() => {
    current.current = page;
  }, [page]);

  const clearFlag = useCallback(() => {
    document.documentElement.removeAttribute('data-ac-wipe');
  }, []);

  /** Ends a wipe at once: the copy goes, the masks and the eraser with it. */
  const end = useCallback(() => {
    const running = job.current;
    if (!running) return;
    job.current = null;
    cancelAnimationFrame(running.raf);
    running.ghost.remove();
    for (const property of MASK_PROPERTIES)
      running.page.style.removeProperty(property);
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.hidden = true;
      for (const child of Array.from(overlay.children))
        (child as HTMLElement).removeAttribute('style');
    }
    clearFlag();
  }, [overlayRef, clearFlag]);

  const drop = useCallback(() => {
    window.clearTimeout(stale.current);
    captured.current = null;
    if (!job.current) clearFlag();
  }, [clearFlag]);

  const capture = useCallback(() => {
    end();
    drop();
    const element = pageRef.current;
    if (!element || prefersReducedMotion()) return;
    const rect = element.getBoundingClientRect();
    // a page that is not on screen has nothing to wipe
    if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    const host = element.closest<HTMLElement>('.ac-root');
    if (!host) return;
    const ghost = element.cloneNode(true) as HTMLElement;
    ghost.classList.add('ac-ghost');
    ghost.setAttribute('aria-hidden', 'true');
    ghost.setAttribute('inert', '');
    ghost.removeAttribute('id');
    for (const withId of ghost.querySelectorAll('[id]'))
      withId.removeAttribute('id');
    Object.assign(ghost.style, {
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      width: `${rect.width}px`,
      height: `${Math.max(0, window.innerHeight - rect.top)}px`,
    });
    captured.current = { ghost, host, rect };
    // the browser must not also fade the change: a view transition would show stills of the pages while the wipe is drawn on the real one
    document.documentElement.setAttribute('data-ac-wipe', '');
    stale.current = window.setTimeout(drop, STALE_MS);
  }, [end, drop, pageRef]);

  // the tabs, the page turns and every link of the skin that goes to another page ask for a copy first (capture phase: before Next navigates)
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>('a[href]');
      if (!link?.closest('.ac-root') || link.hasAttribute('download')) return;
      if (link.target && link.target !== '_self') return;
      let url: URL;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.hash) return;
      const to = pageOfPath(url.pathname);
      if (to && to !== current.current) capture();
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [capture]);

  // the page changed: play the wipe the copy was taken for
  useLayoutEffect(() => {
    const taken = captured.current;
    captured.current = null;
    window.clearTimeout(stale.current);
    const overlay = overlayRef.current;
    const next = pageRef.current;
    if (!taken || !overlay || !next || prefersReducedMotion()) {
      if (!job.current) clearFlag();
      return;
    }
    window.scrollTo(0, 0);
    const haze = overlay.querySelector<HTMLElement>('[data-ac-haze]');
    const eraser = overlay.querySelector<HTMLElement>('[data-ac-eraser]');
    if (!haze || !eraser) return;

    const geometry = wipeGeometry(window.innerWidth, window.innerHeight);
    const oldOrigin = maskOrigin(geometry, taken.rect.left, taken.rect.top);
    const nextRect = next.getBoundingClientRect();
    const nextOrigin = maskOrigin(geometry, nextRect.left, nextRect.top);
    const hazeOrigin = maskOrigin(geometry, 0, 0);
    taken.host.appendChild(taken.ghost);
    eraser.style.width = `${geometry.eraserW}px`;
    eraser.style.height = `${geometry.eraserH}px`;
    overlay.hidden = false;
    const running: Job = { raf: 0, ghost: taken.ghost, page: next };
    job.current = running;

    const start = performance.now();
    const frame = (now: number) => {
      // a wipe that was ended (by another page change) draws nothing more
      if (job.current !== running) return;
      const progress = Math.min(1, (now - start) / WIPE.ms);
      const state = wipeFrame(geometry, progress);
      applyMask(taken.ghost, oldBoardMask(geometry, state, oldOrigin));
      applyMask(next, newBoardMask(geometry, state, nextOrigin));
      applyMask(haze, hazeMask(geometry, state, hazeOrigin));
      haze.style.opacity = String(state.hazeOpacity);
      eraser.style.opacity = state.eraser.visible ? '1' : '0';
      eraser.style.transform = `translate(${state.eraser.x}px, ${state.eraser.y}px) rotate(${state.eraser.angleDeg}deg)`;
      if (progress < 1) running.raf = requestAnimationFrame(frame);
      else end();
    };
    frame(start);
  }, [page, overlayRef, pageRef, end, clearFlag]);

  // leaving the skin in the middle of a wipe
  useEffect(
    () => () => {
      end();
      drop();
    },
    [end, drop],
  );

  return capture;
}

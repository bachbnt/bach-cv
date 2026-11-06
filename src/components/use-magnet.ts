/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type RefObject } from 'react';

/** How far from the edge of a chip the pointer starts to pull it, in px. */
const REACH = 120;
/** The most a chip moves toward the pointer, in px, and how much bigger it gets (a fraction). */
const PULL = 11;
const GROW = 0.07;

/**
 * Pulls the items of `ref` that carry `data-magnet` (direct children, and `ref` must be positioned: it is their offset parent) a little toward the pointer when it comes near, like a magnet, and lets them go
 * again when it leaves. It writes `--tx`, `--ty` and `--s` on each of them; the element turns them into `translate` and `scale` and
 * smooths them with a transition (see the chips of About). Nothing runs without a mouse, or for "reduce motion".
 */
export function useMagnet(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (
      !window.matchMedia(
        '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
      ).matches
    )
      return;

    // the list can arrive after the page (its data is read from Firestore), so it is looked up each time, not once
    const items = () =>
      Array.from(
        ref.current?.querySelectorAll<HTMLElement>('[data-magnet]') ?? [],
      );
    let frame = 0;
    let x = 0;
    let y = 0;
    let pulling = false;

    const release = () => {
      pulling = false;
      for (const el of items()) {
        el.style.removeProperty('--tx');
        el.style.removeProperty('--ty');
        el.style.removeProperty('--s');
      }
    };

    const pull = () => {
      frame = 0;
      const box = ref.current;
      if (!box) return;
      const area = box.getBoundingClientRect();
      const near =
        x > area.left - REACH &&
        x < area.right + REACH &&
        y > area.top - REACH &&
        y < area.bottom + REACH;
      if (!near) {
        if (pulling) release();
        return;
      }
      pulling = true;

      // read everything first, then write (a write between two reads would make the browser lay the page out again for each chip).
      // `offsetLeft` and `offsetTop` ignore transforms, so a chip is measured where it rests, not where the pull has moved it
      const pulls = items().map((el) => {
        const left = area.left + el.offsetLeft;
        const top = area.top + el.offsetTop;
        const dx = x - (left + el.offsetWidth / 2);
        const dy = y - (top + el.offsetHeight / 2);
        // the distance from the pointer to the edge of the chip: a wide chip pulls as much as a narrow one
        const edge = Math.hypot(
          Math.max(left - x, 0, x - (left + el.offsetWidth)),
          Math.max(top - y, 0, y - (top + el.offsetHeight)),
        );
        const strength = Math.max(0, 1 - edge / REACH);
        const centre = Math.hypot(dx, dy);
        const reach = Math.min(centre, PULL * strength);
        return {
          el,
          tx: centre > 0 ? (dx / centre) * reach : 0,
          ty: centre > 0 ? (dy / centre) * reach : 0,
          strength,
        };
      });
      for (const { el, tx, ty, strength } of pulls) {
        el.style.setProperty('--tx', `${tx.toFixed(1)}px`);
        el.style.setProperty('--ty', `${ty.toFixed(1)}px`);
        el.style.setProperty('--s', String(1 + GROW * strength));
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = requestAnimationFrame(pull);
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      release();
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      release();
    };
  }, [ref]);
}

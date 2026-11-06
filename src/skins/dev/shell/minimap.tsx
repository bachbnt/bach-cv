/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';

/** How many grey lines the minimap draws. */
const LINES = 140;

/** The widths and fades of the minimap lines, fixed so the static HTML and the client agree. */
const bars = Array.from({ length: LINES }, (_, i) => ({
  width: 28 + ((i * 37) % 44),
  left: 8 + ((i * 13) % 4) * 4,
  opacity: 0.5 + ((i * 7) % 5) / 10,
}));

/** The sizes that tie the slider to the page: the track (the minimap), the slider and how far the page can scroll. */
function measure(box: HTMLElement) {
  const docHeight = document.documentElement.scrollHeight;
  const viewHeight = window.innerHeight;
  const trackHeight = box.clientHeight;
  const thumbHeight = Math.max(
    28,
    Math.min(trackHeight, (viewHeight / docHeight) * trackHeight),
  );
  return {
    thumbHeight,
    trackHeight,
    /** how far the page can scroll */
    range: Math.max(1, docHeight - viewHeight),
    /** how far the slider can travel */
    travel: Math.max(1, trackHeight - thumbHeight),
  };
}

/**
 * The minimap at the right edge, with the slider that shows which part of the page is on screen. It is for the pointer only (a mouse or
 * a pen; keyboard users have the page itself, so it stays `aria-hidden` and never takes focus): the pointer over it darkens the slider,
 * dragging the slider scrolls the page in proportion, and a click on the track scrolls so that the slider is centred there (smooth,
 * unless the visitor asked for reduced motion). A finger scrolls the page as usual. One set of listeners, with pointer capture while dragging.
 */
export function Minimap() {
  const map = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = map.current;
    const thumb = slider.current;
    if (!box || !thumb) return;

    const place = () => {
      const { thumbHeight, range, travel } = measure(box);
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${Math.min(1, window.scrollY / range) * travel}px)`;
    };
    place();
    window.addEventListener('scroll', place, { passive: true });
    window.addEventListener('resize', place);
    const observer = new ResizeObserver(place);
    observer.observe(document.body);

    // the page position for the slider top at `top` pixels from the top of the track
    const scrollFor = (top: number) => {
      const { range, travel } = measure(box);
      return Math.min(1, Math.max(0, top / travel)) * range;
    };
    let drag: { id: number; startY: number; startScroll: number } | null = null;

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || event.button !== 0) return;
      // no focus change, no text selection
      event.preventDefault();
      const track = box.getBoundingClientRect();
      const { thumbHeight } = measure(box);
      if (thumb.contains(event.target as Node)) {
        drag = {
          id: event.pointerId,
          startY: event.clientY,
          startScroll: window.scrollY,
        };
        box.setPointerCapture(event.pointerId);
        box.dataset.drag = '';
        return;
      }
      window.scrollTo({
        top: scrollFor(event.clientY - track.top - thumbHeight / 2),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'auto'
          : 'smooth',
      });
    };
    const onMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const { range, travel } = measure(box);
      window.scrollTo({
        top:
          drag.startScroll + ((event.clientY - drag.startY) / travel) * range,
        behavior: 'instant',
      });
    };
    const onEnd = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      delete box.dataset.drag;
    };

    box.addEventListener('pointerdown', onDown);
    box.addEventListener('pointermove', onMove);
    box.addEventListener('pointerup', onEnd);
    box.addEventListener('pointercancel', onEnd);
    box.addEventListener('lostpointercapture', onEnd);
    return () => {
      window.removeEventListener('scroll', place);
      window.removeEventListener('resize', place);
      observer.disconnect();
      box.removeEventListener('pointerdown', onDown);
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerup', onEnd);
      box.removeEventListener('pointercancel', onEnd);
      box.removeEventListener('lostpointercapture', onEnd);
    };
  }, []);

  return (
    <div
      data-slot='dev-minimap'
      className='group/map fixed top-(--top) right-0 bottom-(--bottom) z-5 w-[90px] cursor-default overflow-hidden bg-editor opacity-90 select-none [view-transition-name:minimap] max-[1180px]:hidden'
      aria-hidden='true'
      ref={map}
    >
      {bars.map((bar, i) => (
        <i
          key={i}
          className='pointer-events-none mx-2 my-0.5 block h-[3px] rounded-[1px] bg-[color-mix(in_srgb,var(--fg)_20%,transparent)]'
          style={{
            width: `${bar.width}%`,
            marginLeft: bar.left,
            opacity: bar.opacity,
          }}
        />
      ))}
      <div
        data-slot='dev-minimap-slider'
        className='absolute inset-x-0 top-0 border-y border-[color-mix(in_srgb,var(--fg)_14%,transparent)] bg-[color-mix(in_srgb,var(--fg)_11%,transparent)] transition-colors duration-150 group-hover/map:bg-[color-mix(in_srgb,var(--fg)_22%,transparent)] group-data-[drag]/map:bg-[color-mix(in_srgb,var(--fg)_28%,transparent)]'
        ref={slider}
      />
    </div>
  );
}

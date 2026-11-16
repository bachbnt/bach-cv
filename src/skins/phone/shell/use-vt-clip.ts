/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';
import { vtClip } from '@/skins/phone/shell/vt-clip';

const PROPERTY = '--ph-vt-clip';

/**
 * Writes `--ph-vt-clip` on `<html>` (`phone.css` clips `::view-transition` to it): the box of the display and its four corners, measured now,
 * when the window is resized and when the display comes to rest after a fold (while it moves the fold has its own transition). The device is
 * scaled to fit a small window, so the corners are measured as they are drawn. It is not there in a window of its own, where a page change
 * is the whole window, nor when the skin goes.
 */
export function useVtClip(
  display: HTMLElement | null,
  device: boolean,
  resting: boolean,
) {
  useEffect(() => {
    const html = document.documentElement;
    if (!display || !device || !resting) {
      html.style.removeProperty(PROPERTY);
      return;
    }
    const apply = () => {
      const box = display.getBoundingClientRect();
      const scale = display.offsetWidth ? box.width / display.offsetWidth : 1;
      const style = getComputedStyle(display);
      const corner = (value: string) => (parseFloat(value) || 0) * scale;
      html.style.setProperty(
        PROPERTY,
        vtClip(box, { width: innerWidth, height: innerHeight }, [
          corner(style.borderTopLeftRadius),
          corner(style.borderTopRightRadius),
          corner(style.borderBottomRightRadius),
          corner(style.borderBottomLeftRadius),
        ]),
      );
    };
    apply();
    window.addEventListener('resize', apply);
    return () => {
      window.removeEventListener('resize', apply);
      html.style.removeProperty(PROPERTY);
    };
  }, [display, device, resting]);
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';
import type { Fold } from '@/skins/phone/shell/fold-mode';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';

/**
 * Closes the quick settings when the device starts to fold or unfold. The shade is the same size on the cover screen and on the right half of the inner one,
 * but the layout under it is swapped half way through the swing; closing it where the fold begins is the simple, clean way to have nothing of it jump
 * (the visitor opens it again on the screen that is there). It renders nothing.
 */
export function PhFoldGuard({ target }: { target: Fold }) {
  const { closeSettings } = usePhOverlays();
  const was = useRef(target);
  useEffect(() => {
    if (was.current === target) return;
    was.current = target;
    closeSettings();
  }, [target, closeSettings]);
  return null;
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { WIDE_SCREEN } from '@/skins/phone/blocks/use-wide-screen';
import { usePhScreen } from '@/skins/phone/shell/screen-context';

/** The side margin of the pages of an app on a phone (`px-5`). */
const MARGIN = 40;

/**
 * The `sizes` of an image that sits in `columns` equal columns of a page: `wide` px each on a tablet, the share of the screen (less the
 * margins and the `gap` between columns) on a phone. It follows the width of the screen, which is narrower than the window when the
 * device is folded, so the browser does not load a picture twice as large as the one that is drawn.
 */
export function useScreenSizes(wide: number, columns: number, gap: number) {
  const { width } = usePhScreen();
  // until the screen is measured the larger picture is the safe one
  if (width === 0 || width >= WIDE_SCREEN) return `${wide}px`;
  return `${Math.round((width - MARGIN - gap * (columns - 1)) / columns)}px`;
}

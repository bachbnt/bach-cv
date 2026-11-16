/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useScreenAtLeast } from '@/skins/phone/shell/screen-context';

/** The width of the screen from which an app shows its list and the item beside each other (`@min-[900px]:` in the pages). */
export const WIDE_SCREEN = 900;

/** Whether the screen is a tablet: the width of the screen, not of the window; a phone is assumed until the screen is measured. */
export const useWideScreen = (): boolean => useScreenAtLeast(WIDE_SCREEN);

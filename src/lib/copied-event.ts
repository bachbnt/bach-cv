/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * Said on `window` when something was copied to the clipboard. It carries nothing (no text, no detail), so a listener such as the dev
 * log of the Dev skin can note "copied" without ever seeing what was copied.
 */
export const COPIED_EVENT = 'bach-cv:copied';

/** Announces a copy. Call it after the clipboard accepted the text. */
export function announceCopied(): void {
  if (typeof window !== 'undefined')
    window.dispatchEvent(new Event(COPIED_EVENT));
}

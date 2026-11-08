/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * Whether the visitor has a mouse: the chat focuses its field at once for them. On a phone focusing it would raise the keyboard over
 * the answer, so the panel takes the focus instead. Browser only.
 */
export const hasFinePointer = (): boolean =>
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

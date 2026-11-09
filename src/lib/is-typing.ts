/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** Whether a key press belongs to a field the visitor is typing in (a shortcut must not steal a "/" typed into the chat). */
export const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

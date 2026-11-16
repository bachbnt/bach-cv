/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * What scrolls the page: the scroller of the screen when it has one of its own (a device, a tablet layout: it clips), else the document of a
 * phone's window. The shell hands over the same element in both cases, so what it does with its overflow tells which one it is.
 */
export const screenScroller = (scroller: HTMLElement | null): Element | null =>
  scroller && getComputedStyle(scroller).overflowY !== 'visible'
    ? scroller
    : document.scrollingElement;

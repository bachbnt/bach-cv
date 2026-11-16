/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * Scrolls the buttons of the bar up under the bars (the scroll padding of the scroller, which is the bars, and their `scroll-mt` on top of it say how far) inside the scroller of the screen, and only there: the
 * window is not the screen's to move. The popover of a tablet opens below the buttons, and with them low on the screen it would flip over
 * the bar and hide what the choices leave. A screen without a scroller of its own (a phone's window) lets the document do it.
 */
export function raiseToolbar(
  button: HTMLElement | null,
  scroller: HTMLElement | null,
) {
  if (!button) return;
  if (!scroller) {
    button.scrollIntoView({ block: 'start', behavior: 'instant' });
    return;
  }
  const frame = scroller.getBoundingClientRect();
  // a device in a small window is scaled: the rects are in the scaled px, the margin and `scrollTop` are not
  const scale = frame.height / scroller.clientHeight || 1;
  const margin = parseFloat(getComputedStyle(button).scrollMarginTop) || 0;
  const padding = parseFloat(getComputedStyle(scroller).scrollPaddingTop) || 0;
  const gap =
    (button.getBoundingClientRect().top - frame.top) / scale - margin - padding;
  scroller.scrollTo({ top: scroller.scrollTop + gap, behavior: 'instant' });
}

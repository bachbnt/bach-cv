/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Puts the focus on the first control of the page that was behind the lock screen (the first thing a keyboard reader would reach), or on the heading
 * of the page when it has no control, and returns what was focused. `scroller` is the element that holds the page.
 */
export function focusPage(scroller: HTMLElement | null): HTMLElement | null {
  if (!scroller) return null;
  const control = [...scroller.querySelectorAll<HTMLElement>(FOCUSABLE)].find(
    (element) => element.checkVisibility(),
  );
  const target =
    control ?? scroller.querySelector<HTMLElement>('h1, h2, [role="heading"]');
  if (!target) return null;
  if (!control) target.tabIndex = -1;
  target.focus({ preventScroll: true });
  return target;
}

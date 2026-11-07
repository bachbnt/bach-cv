/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

let timer = 0;

/**
 * Scrolls to the element with `id`, which may not be there yet (the page of a skin loads after the click that asked for it) and may
 * move a little as the page above it fills in: it looks for the element for up to three seconds, scrolls when it finds it and once
 * more a moment later, and gives up if the visitor scrolls on their own in between. Only one search runs at a time.
 */
export function revealById(id: string): void {
  window.clearInterval(timer);
  let waited = 0;
  let found = 0;
  let touched = false;
  const stop = () => {
    window.clearInterval(timer);
    window.removeEventListener('wheel', onUser);
    window.removeEventListener('touchmove', onUser);
    window.removeEventListener('keydown', onUser);
  };
  const onUser = () => {
    touched = true;
    stop();
  };
  window.addEventListener('wheel', onUser, { passive: true });
  window.addEventListener('touchmove', onUser, { passive: true });
  window.addEventListener('keydown', onUser);
  timer = window.setInterval(() => {
    waited += 100;
    const el = document.getElementById(id);
    if (el && !touched) {
      el.scrollIntoView({ block: 'start' });
      found += 1;
    }
    if (touched || found >= 5 || waited >= 3000) stop();
  }, 100);
}

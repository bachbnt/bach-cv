/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * Scrolls to the TOP of `target` once the animations around it have ended, and returns what undoes the wait. A role note OPENS with an
 * animation (the body grows for 300 ms), the rows of the education slide in and the page may still be rising, so the target is not where
 * it will end up when it is first found: asking to scroll at once would aim at the place it had and end somewhere else. Only the animations
 * that END count (the "Current" dot of the current job pulses for ever) and at most for a second, so a stuck animation cannot keep the
 * visitor from what they asked for. A wheel, a touch or a key of the visitor cancels it. `done` runs when the scroll was made or the
 * visitor took over, not when the caller undoes the wait (it may ask again).
 */
export function scrollWhenSettled(
  target: HTMLElement,
  reduced: boolean,
  done?: () => void,
): () => void {
  let cancelled = false;
  const takeOver = () => {
    cancelled = true;
    done?.();
  };
  window.addEventListener('wheel', takeOver, { passive: true, once: true });
  window.addEventListener('touchmove', takeOver, { passive: true, once: true });
  window.addEventListener('keydown', takeOver, { once: true });
  const settled = () =>
    Promise.race([
      Promise.allSettled(
        document
          .getAnimations()
          .filter((animation) => {
            const owner =
              animation.effect instanceof KeyframeEffect
                ? animation.effect.target
                : null;
            return (
              owner instanceof Element &&
              (owner.contains(target) || target.contains(owner)) &&
              animation.effect?.getComputedTiming().iterations !== Infinity
            );
          })
          .map((animation) => animation.finished),
      ),
      new Promise((resolve) => window.setTimeout(resolve, 1000)),
    ]);
  let frame = 0;
  // two frames: a transition only exists once the browser has styled the change that started it
  frame = requestAnimationFrame(() => {
    frame = requestAnimationFrame(() => {
      void settled().then(() => {
        if (cancelled) return;
        target.scrollIntoView({
          block: 'start',
          behavior: reduced ? 'auto' : 'smooth',
        });
        done?.();
      });
    });
  });
  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    window.removeEventListener('wheel', takeOver);
    window.removeEventListener('touchmove', takeOver);
    window.removeEventListener('keydown', takeOver);
  };
}

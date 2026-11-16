/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** How long a scrollbar stays after the scrolling has stopped, in ms. */
export const CUE_MS = 800;

/**
 * The timing of the scrollbar cue, apart from the DOM: a thing that scrolls is `note`d and shown (`show(thing, true)`) at once and again and
 * again as it goes on, and hidden (`show(thing, false)`) `delay` ms after its last note. `stop` hides everything at once (the page goes away).
 * `schedule` and `cancel` are the timers (`setTimeout`, `clearTimeout`), passed in so that the logic can be tested with a clock of its own.
 */
export function scrollCue<T>(
  show: (thing: T, on: boolean) => void,
  schedule: (run: () => void, delay: number) => number,
  cancel: (id: number) => void,
  delay = CUE_MS,
) {
  const timers = new Map<T, number>();
  return {
    note(thing: T) {
      const pending = timers.get(thing);
      if (pending === undefined) show(thing, true);
      else cancel(pending);
      timers.set(
        thing,
        schedule(() => {
          timers.delete(thing);
          show(thing, false);
        }, delay),
      );
    },
    stop() {
      timers.forEach((id, thing) => {
        cancel(id);
        show(thing, false);
      });
      timers.clear();
    },
  };
}

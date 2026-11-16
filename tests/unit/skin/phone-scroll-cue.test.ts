/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { scrollCue } from '@/skins/phone/shell/scroll-cue';

/** A clock of its own: timers run when it is told that time has passed. */
function clock() {
  let now = 0;
  let next = 1;
  const timers = new Map<number, { at: number; run: () => void }>();
  return {
    schedule: (run: () => void, delay: number) => {
      timers.set(next, { at: now + delay, run });
      return next++;
    },
    cancel: (id: number) => void timers.delete(id),
    pass(ms: number) {
      now += ms;
      for (const [id, timer] of [...timers])
        if (timer.at <= now) {
          timers.delete(id);
          timer.run();
        }
    },
  };
}

describe('the scrollbar cue', () => {
  it('shows a scroller at its first scroll and hides it 800 ms after its last', () => {
    const time = clock();
    const events: string[] = [];
    const cue = scrollCue<string>(
      (thing, on) => events.push(`${thing}:${on}`),
      time.schedule,
      time.cancel,
    );
    cue.note('screen');
    time.pass(500);
    cue.note('screen');
    time.pass(500);
    // 500 ms after the second note: still there
    expect(events).toEqual(['screen:true']);
    time.pass(300);
    expect(events).toEqual(['screen:true', 'screen:false']);
  });

  it('keeps the timers of different scrollers apart', () => {
    const time = clock();
    const events: string[] = [];
    const cue = scrollCue<string>(
      (thing, on) => events.push(`${thing}:${on}`),
      time.schedule,
      time.cancel,
    );
    cue.note('pane');
    time.pass(400);
    cue.note('screen');
    time.pass(400);
    expect(events).toEqual(['pane:true', 'screen:true', 'pane:false']);
  });

  it('hides everything at once when it is stopped, and then nothing comes back', () => {
    const time = clock();
    const events: string[] = [];
    const cue = scrollCue<string>(
      (thing, on) => events.push(`${thing}:${on}`),
      time.schedule,
      time.cancel,
    );
    cue.note('a');
    cue.note('b');
    cue.stop();
    time.pass(2000);
    expect(events).toEqual(['a:true', 'b:true', 'a:false', 'b:false']);
  });
});

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState } from 'react';
import type { Doc } from '@/lib/content/schema';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';
import { useTrade } from '@/skins/trade/shell/trade-context';

/**
 * Which role notes are open and which role the visitor asked for (a bar, an event, a role of the skills map, a flag of the chart),
 * shared by every block of the page that points at a role. The first role is open as in Standard; a role asked for opens and is
 * scrolled to.
 */
export function useReveal(jobs: Doc<'experience'>[]) {
  const { jobId, jobAsk } = useTrade();
  const reduced = useReducedMotion();
  const firstId = jobs[0]?.id;
  // what the visitor (or a request) decided; a role not in it follows the default, which is open for the first one
  const [decided, setDecided] = useState(
    () => new Map<string, boolean>(jobId ? [[jobId, true]] : []),
  );
  const [target, setTarget] = useState<{ id: string; n: number } | null>(
    jobId ? { id: jobId, n: 0 } : null,
  );
  const [seenAsk, setSeenAsk] = useState(jobAsk);

  const reveal = (id: string) => {
    setDecided((old) => new Map(old).set(id, true));
    setTarget((old) => ({ id, n: (old?.n ?? 0) + 1 }));
  };
  // a flag of the chart asked for another job while this page is on screen
  if (jobAsk !== seenAsk) {
    setSeenAsk(jobAsk);
    if (jobId) reveal(jobId);
  }
  const toggle = (id: string) =>
    setDecided((old) => new Map(old).set(id, !(old.get(id) ?? id === firstId)));
  const open = new Set(
    jobs
      .filter((job) => decided.get(job.id) ?? job.id === firstId)
      .map((job) => job.id),
  );

  // A flag of the chart (or the search) asked for a job. Its note OPENS with an animation (the body grows for 300 ms) and the page may
  // still be rising in, so the note is not where it will end up when this effect runs: asking to scroll now would aim at the shut note
  // and end somewhere else. Wait for the animations of the note and of the page to finish, then scroll to the TOP of the note (the
  // visitor reads it from its first line, also when it is taller than the panel). A scroll, a touch or a key of the visitor cancels it.
  // `ready`: the notes are not on the page until the jobs have arrived, so a request made before that waits for them
  const ready = jobs.length > 0;
  useEffect(() => {
    if (!target || !ready) return;
    const note = document.getElementById(`tv-note-${target.id}`);
    if (!note) return;
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    window.addEventListener('wheel', cancel, { passive: true, once: true });
    window.addEventListener('touchmove', cancel, { passive: true, once: true });
    window.addEventListener('keydown', cancel, { once: true });
    let frame = 0;
    // Only the animations that END count (the "Current" dot of the current job pulses for ever, and waiting for it would never stop),
    // and at most for a second, so a stuck animation cannot keep the visitor from the job they asked for.
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
                (owner.contains(note) || note.contains(owner)) &&
                animation.effect?.getComputedTiming().iterations !== Infinity
              );
            })
            .map((animation) => animation.finished),
        ),
        new Promise((resolve) => window.setTimeout(resolve, 1000)),
      ]);
    // two frames: a transition only exists once the browser has styled the change that started it
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        void settled().then(() => {
          if (!cancelled)
            note.scrollIntoView({
              block: 'start',
              behavior: reduced ? 'auto' : 'smooth',
            });
        });
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchmove', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [target, reduced, ready]);

  return { open, activeId: target?.id ?? null, reveal, toggle };
}

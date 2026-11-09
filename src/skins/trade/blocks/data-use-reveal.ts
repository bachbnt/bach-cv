/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState } from 'react';
import type { Doc } from '@/lib/content/schema';
import { scrollWhenSettled } from '@/skins/trade/blocks/data-scroll-settled';
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

  // A flag of the chart (or the search) asked for a job. Its note OPENS with an animation and the page may still be rising in, so
  // wait for them to end (`scrollWhenSettled`) and scroll to the TOP of the note: the visitor reads it from its first line, also when
  // it is taller than the panel. `ready`: the notes are not on the page until the jobs have arrived, so a request made before that waits.
  const ready = jobs.length > 0;
  useEffect(() => {
    if (!target || !ready) return;
    const note = document.getElementById(`tv-note-${target.id}`);
    if (!note) return;
    return scrollWhenSettled(note, reduced);
  }, [target, reduced, ready]);

  return { open, activeId: target?.id ?? null, reveal, toggle };
}

/**
 * The degree a flag of the chart asked for: once the jobs and the degrees are on the page, scroll to the top of its row (the rows of
 * the education have the ids `tv-degree-<id>`), then forget the ask, so that a later visit to Resume starts at the top as usual.
 */
export function useRevealDegree(ready: boolean) {
  const { degreeAsk, doneDegree } = useTrade();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!degreeAsk || !ready) return;
    const row = document.getElementById(`tv-degree-${degreeAsk.id}`);
    if (!row) return;
    return scrollWhenSettled(row, reduced, doneDegree);
  }, [degreeAsk, ready, reduced, doneDegree]);
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type RefObject } from 'react';
import { hiddenLabels, type Box } from '@/skins/travel/map/declutter';

/** A little longer than the sprites' size transition (0.2 s), so the boxes are measured where they come to rest. */
const SETTLE_MS = 280;

const boxOf = (element: Element): Box => {
  const r = element.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

/**
 * Keeps the name tags of the sights from lying on the cards of the stops or on each other. It runs once the camera is at rest
 * (`calm`), not while it moves, and only toggles a class on the tags (they are decoration).
 */
export function useDeclutter(
  stage: RefObject<HTMLElement | null>,
  calm: boolean,
  deps: readonly unknown[],
) {
  useEffect(() => {
    const root = stage.current;
    if (!root || !calm) return;
    const timer = window.setTimeout(() => {
      const view = boxOf(root);
      const inside = (b: Box) =>
        b.x < view.x + view.w &&
        b.x + b.w > view.x &&
        b.y < view.y + view.h &&
        b.y + b.h > view.y;
      const tags = [...root.querySelectorAll<HTMLElement>('[data-sight]')].map(
        (sight) => ({
          tag: sight.querySelector<HTMLElement>('.tl-name'),
          rank: Number(sight.dataset.rank ?? 0),
          id: sight.dataset.sight ?? '',
        }),
      );
      const obstacles = [
        ...root.querySelectorAll(
          '.tl-pin-head, .tl-pin-label, .tl-pin-flag, .tl-traveller-badge',
        ),
      ].map(boxOf);
      const labels = tags.flatMap(({ tag, rank, id }) =>
        tag ? [{ id, box: boxOf(tag), rank, tag }] : [],
      );
      const hidden = hiddenLabels(
        labels.filter((l) => inside(l.box)),
        obstacles,
      );
      for (const { id, tag } of labels)
        tag.classList.toggle('tl-off', hidden.has(id));
    }, SETTLE_MS);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the caller lists what changes the layout
  }, [stage, calm, ...deps]);
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, type RefObject } from 'react';
import {
  cardSide,
  placeTags,
  sideOf,
  SIDES,
  type Box,
} from '@/skins/travel/map/declutter';

/** A little longer than the sprites' size transition (0.2 s), so the boxes are measured where they come to rest. */
const SETTLE_MS = 280;

const boxOf = (element: Element): Box => {
  const r = element.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};

/**
 * Keeps the name tags of the sights from lying on the cards of the stops or on each other: a tag that is covered moves to another
 * side of its sight, and one with no free side is left out. It runs once the camera is at rest (`calm`), not while it moves, and
 * only changes the side class and `tl-off` of the tags (they are decoration).
 */
export function useDeclutter(
  stage: RefObject<HTMLElement | null>,
  calm: boolean,
  layout: string,
) {
  useEffect(() => {
    const root = stage.current;
    const view = root?.querySelector<HTMLElement>('.tl-view');
    if (!root || !view || !calm) return;
    const timer = window.setTimeout(() => {
      const frame = boxOf(root);
      const inside = (b: Box) =>
        b.x < frame.x + frame.w &&
        b.x + b.w > frame.x &&
        b.y < frame.y + frame.h &&
        b.y + b.h > frame.y;
      const z = view.getBoundingClientRect().width / view.offsetWidth;
      const sc = Number(getComputedStyle(view).getPropertyValue('--tl-sc'));
      // the cards of the stops first: each takes the side that covers the drawings and the other cards less
      const arts = [...root.querySelectorAll('[data-sight] .tl-art')].map(
        (art) => {
          const b = boxOf(art);
          // the drawing's box has empty corners: only its middle counts
          return {
            x: b.x + b.w * 0.2,
            y: b.y + b.h * 0.15,
            w: b.w * 0.6,
            h: b.h * 0.85,
          };
        },
      );
      const pins = [...root.querySelectorAll<HTMLElement>('.tl-pin')];
      for (const pin of pins) {
        const label = pin.querySelector('.tl-pin-label');
        const head = pin.querySelector('.tl-pin-head');
        if (!label || !head) continue;
        const others = pins
          .filter((other) => other !== pin)
          .flatMap((other) => [
            ...other.querySelectorAll(
              '.tl-pin-label, .tl-pin-head, .tl-pin-flag',
            ),
          ])
          .map(boxOf);
        const headBox = boxOf(head);
        const now = pin.classList.contains('tl-pin-left') ? 'left' : 'right';
        const side = cardSide(now, boxOf(label), headBox.x + headBox.w / 2, [
          ...arts,
          ...others,
        ]);
        pin.classList.toggle('tl-pin-left', side === 'left');
      }
      const artOf = new Map(
        [...root.querySelectorAll<HTMLElement>('[data-sight]')].map(
          (sprite) => [sprite.dataset.sight, sprite.querySelector('.tl-art')],
        ),
      );
      const sights = [
        ...root.querySelectorAll<HTMLElement>('[data-label]'),
      ].flatMap((sprite) => {
        const tag = sprite.querySelector<HTMLElement>('.tl-name');
        if (!tag) return [];
        const id = sprite.dataset.label ?? '';
        const anchor = sprite.getBoundingClientRect();
        const artBox = artOf.get(id);
        const art = artBox?.getBoundingClientRect();
        // how far up the drawing is drawn, as a part of its 160 px box: the tag over the top stands on that, not on the box
        const content = artBox?.querySelector('svg')?.getBBox();
        const crown = content ? Math.min(1.1, (160 - content.y) / 160) : 0.9;
        sprite.style.setProperty('--tl-crown', String(crown));
        return [
          {
            sprite,
            tag,
            id,
            rank: Number(sprite.dataset.rank ?? 0),
            anchor: { x: anchor.left, y: anchor.top },
            artTop: art ? art.top + art.height * (1 - crown) : anchor.top,
            size: { w: tag.offsetWidth, h: tag.offsetHeight },
            prefer: sideOf(sprite.dataset.side),
          },
        ];
      });
      const obstacles = [
        ...root.querySelectorAll(
          '.tl-pin-head, .tl-pin-label, .tl-pin-flag, .tl-traveller-badge',
        ),
      ].map(boxOf);
      const placed = placeTags(
        sights.filter(({ anchor }) =>
          inside({ x: anchor.x - 200, y: anchor.y - 100, w: 400, h: 200 }),
        ),
        obstacles,
        z,
        sc,
      );
      for (const { sprite, tag, id, prefer } of sights) {
        const side = placed.get(id);
        for (const s of SIDES) sprite.classList.remove(`tl-tag-${s}`);
        sprite.classList.add(`tl-tag-${side ?? prefer}`);
        tag.classList.toggle('tl-off', side === null);
      }
    }, SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [stage, calm, layout]);
}

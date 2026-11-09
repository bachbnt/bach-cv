/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import type { travelMapCopy } from '@/content/copy/travel-map';
import { worldOf } from '@/skins/travel/map/iso';
import { SIGHTS } from '@/skins/travel/map/sights';

type Words = (typeof travelMapCopy)['en'];

/** Over everything of the map, the pins and the traveller too: a pin standing over the words of a card made them unreadable. The card takes no pointer, so the pins under it still work. */
const INFO_Z = 30000;

/**
 * The card of the sight that is pointed at, tapped or picked in the list: its name and a few words. It is decoration like the drawing
 * (`aria-hidden`; the list of places says the same in words), above the drawing and on the top layer. While it is up the drawing is
 * lifted (`data-hot`) and its own name tag gives way (`data-info`).
 */
export function SightInfo({ id, words }: { id: string | null; words: Words }) {
  const card = useRef<HTMLDivElement>(null);
  const sight = SIGHTS.find((s) => s.id === id);
  useEffect(() => {
    if (!sight) return;
    const art = document.querySelector(`[data-sight="${sight.id}"]`);
    const tag = document.querySelector<HTMLElement>(
      `[data-label="${sight.id}"]`,
    );
    art?.setAttribute('data-hot', '');
    tag?.setAttribute('data-info', '');
    // the card stands on what is drawn, like the tag over the top (`use-declutter.ts` measures it)
    const crown = tag?.style.getPropertyValue('--tl-crown');
    if (crown) card.current?.style.setProperty('--tl-crown', crown);
    return () => {
      art?.removeAttribute('data-hot');
      tag?.removeAttribute('data-info');
    };
  }, [sight]);
  if (!sight) return null;
  const at = worldOf(sight.lat, sight.lng);
  const copy = words.sights[sight.id];
  return (
    <div
      ref={card}
      aria-hidden='true'
      className='tl-sprite tl-info'
      style={
        {
          left: at.x,
          top: at.y,
          zIndex: INFO_Z,
          '--tl-art': sight.scale,
        } as CSSProperties
      }
    >
      <p className='tl-info-card'>
        <b>{copy.name}</b>
        <span>{copy.text}</span>
      </p>
    </div>
  );
}

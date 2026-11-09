/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { travelMapCopy } from '@/content/copy/travel-map';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { SIGHTS } from '@/skins/travel/map/sights';
import { useTravel } from '@/skins/travel/shell/travel-context';

/** The sights ordered the best known first (the order of the list, and of the camera's tour of them when they are walked with the keys). */
const BY_FAME = [...SIGHTS].sort((a, b) => a.fame - b.fame);

/**
 * The famous places of the map as a list of buttons: the keyboard and the screen reader reach them here (the drawings on the map are
 * decoration). A press flies the camera to the place and opens its card; the words of the card are read out below the list.
 */
export function PlacesList() {
  const words = useCopy(travelMapCopy);
  const { sight, showSight } = useTravel();
  const open = sight ? words.sights[sight.id] : null;
  return (
    <section aria-labelledby='tl-places'>
      <h2 id='tl-places' className='m-0 mb-1 text-[17px] font-extrabold'>
        {words.places.title}
      </h2>
      <p className='m-0 mb-2 text-[13px] text-tl-muted'>{words.places.intro}</p>
      <ul className='m-0 flex list-none flex-wrap gap-1.5 p-0'>
        {BY_FAME.map(({ id }) => (
          <li key={id}>
            <button
              type='button'
              aria-pressed={sight?.id === id}
              onClick={() => showSight(sight?.id === id ? null : id, true)}
              className='inline-flex min-h-8 cursor-pointer items-center rounded-full border-0 bg-tl-chip px-3 py-1 text-[13px] font-bold text-tl-chip-ink transition-colors hover:bg-tl-coral-2 aria-pressed:bg-tl-coral aria-pressed:text-tl-on-coral pointer-coarse:min-h-11'
            >
              {words.sights[id].name}
            </button>
          </li>
        ))}
      </ul>
      <p role='status' className='m-0 mt-2 min-h-5 text-[13px] text-tl-muted'>
        {open && sight ? fill(words.places.shown, open) : ''}
      </p>
    </section>
  );
}

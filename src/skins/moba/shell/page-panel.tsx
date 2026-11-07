/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronsRight, Map as MapIcon } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { PLACE } from '@/skins/moba/config';
import { pageName } from '@/skins/moba/map/page-name';
import { useGame } from '@/skins/moba/shell/game-context';
import { MbKbd } from '@/skins/moba/ui/mb-kbd';

/**
 * The page, open over the map like an in-game window: a title bar with the place and a button that folds it away to show the map, and
 * the page itself in a scrolling area. Folded it is inert and out of the reading order; a tab brings it back. A phone gives it the
 * whole screen.
 */
export function PagePanel({ children }: { children: ReactNode }) {
  const common = useCopy(commonCopy);
  const copy = useCopy(mobaCopy);
  const { current, lost, panelOpen, setPanelOpen } = useGame();
  const scroll = useRef<HTMLDivElement>(null);
  const name = lost ? '404' : pageName(current, common, copy);

  // a new page starts at its top
  useEffect(() => {
    scroll.current?.scrollTo({ top: 0 });
  }, [current]);

  return (
    <>
      <main
        aria-label={name}
        data-open={panelOpen}
        inert={!panelOpen}
        className='mb-panel absolute z-30 flex flex-col max-[719px]:z-[45] min-[1100px]:top-[56px] min-[1100px]:right-0 min-[1100px]:bottom-[176px] min-[1100px]:w-[min(780px,54vw)] max-[1099px]:inset-x-0 max-[1099px]:top-[52px] max-[1099px]:bottom-[170px] max-[719px]:bottom-0'
      >
        <header className='mb-panel-head flex flex-none items-center gap-3 px-5 py-2.5 max-[719px]:px-3'>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-[10px] leading-none font-bold tracking-[0.2em] text-mb-teal-ink uppercase'>
              {lost ? copy.states.notFoundKicker : copy.placeHints[current]}
            </p>
            <p className='mt-1 flex items-center gap-2 truncate font-mb-display text-[26px] leading-none font-bold text-mb-title max-[719px]:text-[22px]'>
              {lost ? name : copy.places[current]}
              {!lost && <MbKbd>{PLACE[current].key}</MbKbd>}
            </p>
          </div>
          <button
            type='button'
            className='mb-btn mb-btn-ghost min-h-10 gap-2 px-3 text-[11px] pointer-coarse:min-h-11'
            aria-label={copy.panel.fold}
            onClick={() => setPanelOpen(false)}
          >
            <MapIcon aria-hidden='true' className='size-4' />
            <span className='max-[719px]:hidden'>{copy.panel.close}</span>
            <ChevronsRight
              aria-hidden='true'
              className='size-4 max-[1099px]:hidden'
            />
          </button>
        </header>
        <div
          ref={scroll}
          className='mb-panel-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain'
        >
          <div key={current} className='mb-page-in'>
            {children}
          </div>
        </div>
      </main>
      {!panelOpen && (
        <button
          type='button'
          className='mb-btn mb-btn-gold mb-fold-tab absolute z-30 min-h-11 gap-2 px-4 text-xs min-[1100px]:top-[68px] min-[1100px]:right-4 max-[1099px]:top-[64px] max-[1099px]:right-3'
          onClick={() => setPanelOpen(true)}
        >
          {fill(copy.panel.unfold, { page: name })}
        </button>
      )}
    </>
  );
}

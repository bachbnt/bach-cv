/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { tradeCopy } from '@/content/copy/trade';
import { useCopy } from '@/lib/i18n/copy';
import { useFeaturedProjects } from '@/skins/trade/blocks/home-featured';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { TvButton } from '@/skins/trade/ui/tv-button';

/** The sections of Home in the order they come, and the id each one has. */
const SECTIONS = [
  { key: 'projects', id: 'tv-home-projects' },
  { key: 'work', id: 'tv-home-work' },
  { key: 'build', id: 'tv-home-build' },
  { key: 'contact', id: 'contact' },
] as const;

/**
 * The bar above the dashboard of Home: a button for each section that scrolls to it, as the tabs of a terminal panel do. The
 * projects button is left out when the widget is (no featured projects, or they failed to load).
 */
export function HomeBar() {
  const copy = useCopy(tradeCopy).tabs;
  const reduced = useReducedMotion();
  const { query, featured } = useFeaturedProjects();
  const hideProjects =
    query.isError || (!query.isPending && featured.length === 0);
  return (
    <div
      role='group'
      aria-label={copy.label}
      className='flex min-h-[34px] flex-none items-center gap-0.5 overflow-x-auto border-b border-tv-line px-2'
    >
      {SECTIONS.filter(({ key }) => key !== 'projects' || !hideProjects).map(
        ({ key, id }) => (
          <TvButton
            key={key}
            variant='ghost'
            size='sm'
            onClick={() =>
              document.getElementById(id)?.scrollIntoView({
                block: 'start',
                behavior: reduced ? 'auto' : 'smooth',
              })
            }
            className='text-tv-mute hover:text-tv-ink active:text-tv-ink'
          >
            {copy[key]}
          </TvButton>
        ),
      )}
    </div>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, ViewTransition, type ReactNode } from 'react';
import { shell } from '@/lib/content/shell';
import type { PageKey } from '@/lib/content/schema';
import { PAGE_FOCUS, PAGE_PANEL, ROUTE_PAGES } from '@/skins/travel/config';
import { SIGHTS } from '@/skins/travel/map/sights';
import { TravelMap } from '@/skins/travel/map/travel-map';
import type { MapFocus } from '@/skins/travel/map/types';
import { Header } from '@/skins/travel/shell/header';
import { Rail } from '@/skins/travel/shell/rail';
import { TravelOverlays } from '@/skins/travel/shell/travel-overlays';
import { TravelProvider, useTravel } from '@/skins/travel/shell/travel-context';
import { TlRoot } from '@/skins/travel/ui/tl-root';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * The frame of the Travel skin: a trip map of Nha Trang. The header on top, the pages as tabs (a rail, or a bar on a phone), and the
 * map under everything; the page is the card that floats over it (a sheet from the bottom on a phone). The map and the traveller stay
 * where they are when the page changes.
 */
export function TravelShell({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  return (
    <TravelProvider>
      <Frame page={page}>{children}</Frame>
    </TravelProvider>
  );
}

/** How close the camera comes to a sight that was picked in the list. */
const SIGHT_ZOOM = 1.1;

function Frame({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  const { stops, selectedId, select, sight, showSight, stopTour } = useTravel();
  const router = useRouter();
  useEffect(() => showSight(null), [page, showSight]);
  // the tour is started and stopped on Home: leaving it ends it, or the card of another page would go on stepping by itself
  useEffect(() => {
    if (page !== 'home') stopTour();
  }, [page, stopTour]);
  const reduced = useReducedMotion();
  const routeOn = ROUTE_PAGES.includes(page);
  const mapStops = useMemo(() => stops.map((s) => s.map), [stops]);
  const picked = sight?.fly ? SIGHTS.find((s) => s.id === sight.id) : undefined;
  const focus: MapFocus = picked
    ? { kind: 'place', lat: picked.lat, lng: picked.lng, zoom: SIGHT_ZOOM }
    : selectedId && routeOn
      ? { kind: 'stop', id: selectedId }
      : page
        ? PAGE_FOCUS[page]
        : { kind: 'overview' };
  const current =
    mapStops.find((s) => s.current)?.id ??
    mapStops.filter((s) => !s.placed.side).at(-1)?.id ??
    null;
  return (
    <TlRoot className='fixed inset-0 grid grid-cols-1 grid-rows-[54px_minmax(0,1fr)_56px] md:grid-cols-[84px_minmax(0,1fr)] md:grid-rows-[60px_minmax(0,1fr)]'>
      <Header />
      <Rail page={page} />
      <main className='relative isolate min-h-0 overflow-hidden max-md:order-2 md:col-2 md:row-2'>
        <TravelMap
          stops={mapStops}
          activeId={selectedId ?? current}
          routeOn={routeOn}
          focus={focus}
          panel={page ? PAGE_PANEL[page] : 'left'}
          avatar={shell.avatar}
          travellerName={shell.name}
          reduced={reduced}
          sightId={sight?.id ?? null}
          onSight={showSight}
          onSelect={(id) => {
            select(id);
            if (page !== 'resume') router.push('/resume');
          }}
        />
        <ViewTransition
          key={page ?? 'not-found'}
          enter='tl-vt-in'
          exit='tl-vt-out'
          default='none'
        >
          <div className='pointer-events-none absolute inset-0 z-20'>
            {children}
          </div>
        </ViewTransition>
      </main>
      <TravelOverlays />
    </TlRoot>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { routeStops, type RouteStop } from '@/lib/derive/route-stops';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { STOP_COLORS } from '@/skins/travel/config';
import { placeStops } from '@/skins/travel/map/route';
import type { MapStop } from '@/skins/travel/map/types';

export type CareerStop = RouteStop<Doc<'experience'>, Doc<'education'>>;

/** A stop of the trip: the career place (from `lib/derive`), where it is on the map and how its pin reads. */
export interface TripStop {
  career: CareerStop;
  map: MapStop;
}

interface TravelContextValue {
  /** the stops in the order of the career (empty while the career loads or when there is none) */
  stops: TripStop[];
  /** the stop the card is about, or null (then the traveller waits at the current stop) */
  selectedId: string | null;
  select: (id: string | null) => void;
  /** the traveller rides to every stop in turn, from the first to the last; the card follows */
  touring: boolean;
  startTour: () => void;
  stopTour: () => void;
  /** the CV window */
  cvOpen: boolean;
  openCv: () => void;
  closeCv: () => void;
  queries: {
    experience: ReturnType<typeof useContentQuery<'experience'>>;
    education: ReturnType<typeof useContentQuery<'education'>>;
  };
}

const TravelContext = createContext<TravelContextValue | null>(null);

/** How long the tour stays at a stop. */
const TOUR_STAY_MS = 2600;

/**
 * What the parts of the Travel frame share: the career as the stops of the trip (read through the Standard hooks and ordered by
 * `routeStops` of `lib/derive`), the stop that is open, the tour, and the CV window.
 */
export function TravelProvider({ children }: { children: ReactNode }) {
  const experience = useContentQuery('experience');
  const education = useContentQuery('education');
  const { lang } = useLang();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [touring, setTouring] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const stops = useMemo<TripStop[]>(() => {
    const career = routeStops(
      experience.data ?? [],
      education.data ?? [],
      new Date(),
    );
    const placed = placeStops(career);
    return career.flatMap((stop, i) => {
      const where = placed[i];
      const period = formatPeriod(stop.startMonth, stop.endMonth, lang);
      const title = stop.type === 'job' ? stop.job.company : stop.school;
      const detail =
        stop.type === 'job'
          ? stop.job.role
          : stop.degrees.map((d) => d.degree).join(', ');
      const main = career.slice(0, i).filter((s) => !s.side).length;
      return [
        {
          career: stop,
          map: {
            id: stop.id,
            name: `${title}, ${detail}, ${period}`,
            title,
            period,
            color: stop.current ? 0 : (main % STOP_COLORS) + 1,
            type: stop.type,
            current: stop.current,
            placed: where,
          },
        },
      ];
    });
  }, [experience.data, education.data, lang]);

  const stopTour = useCallback(() => {
    window.clearTimeout(timer.current);
    setTouring(false);
  }, []);
  const select = useCallback(
    (id: string | null) => {
      stopTour();
      setSelectedId(id);
    },
    [stopTour],
  );
  const startTour = useCallback(() => {
    window.clearTimeout(timer.current);
    setTouring(true);
    const ids = stops.map((s) => s.career.id);
    const visit = (i: number) => {
      if (i >= ids.length) {
        setTouring(false);
        return;
      }
      setSelectedId(ids[i]);
      timer.current = window.setTimeout(() => visit(i + 1), TOUR_STAY_MS);
    };
    visit(0);
  }, [stops]);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const value = useMemo<TravelContextValue>(
    () => ({
      stops,
      selectedId,
      select,
      touring,
      startTour,
      stopTour,
      cvOpen,
      openCv: () => setCvOpen(true),
      closeCv: () => setCvOpen(false),
      queries: { experience, education },
    }),
    [
      stops,
      selectedId,
      select,
      touring,
      startTour,
      stopTour,
      cvOpen,
      experience,
      education,
    ],
  );
  return (
    <TravelContext.Provider value={value}>{children}</TravelContext.Provider>
  );
}

export function useTravel(): TravelContextValue {
  const value = useContext(TravelContext);
  if (!value) throw new Error('useTravel must be used inside <TravelProvider>');
  return value;
}

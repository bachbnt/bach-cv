/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRouter } from 'next/navigation';
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
import type { Doc, PageKey } from '@/lib/content/schema';
import { PAGE_META } from '@/lib/pages';
import { useContentQuery } from '@/lib/query/use-content';
import {
  cameraOffset,
  focusFor,
  isWide,
  scaleFor,
  type View,
} from '@/skins/moba/world/camera';
import { cellsAround } from '@/skins/moba/world/abilities';
import { careerStops, type CareerStop } from '@/skins/moba/world/career-stops';
import { WORLD, dist, type Pt } from '@/skins/moba/world/geometry';
import { nearestWalkable, routeTo } from '@/skins/moba/world/ground';
import {
  STATIONS,
  stationById,
  stationOfPage,
  type Station,
  type StationId,
} from '@/skins/moba/world/stations';
import { Walker, type Direction } from '@/skins/moba/world/walker';
import { useReducedMotion } from '@/skins/moba/shell/use-reduced-motion';

/** What a page should show when the visitor arrives from a place of the map (the tower of a role, the slot of a certificate). */
export interface Focus {
  kind: 'job' | 'certificate';
  id: string;
}

/** The place the champion is walking to, and what to do on arrival. */
interface Destination {
  page?: PageKey;
  focus?: Focus;
  station?: StationId;
}

type Job = Doc<'experience'>;

/** How far apart the cells that the champion reveals are, and how far each one sees. */
const CELL = 90;
export const VISION = 190;
const RECALL_MS = 900;
const CAPTURE_RADIUS = 52;

interface GameValue {
  current: PageKey;
  /** the path is not a page (the 404 screen): the champion stands at the fountain and the panel says so */
  lost: boolean;
  view: View;
  wide: boolean;
  scale: number;
  /** callback refs for the elements the moving parts are on: the walker moves them without rendering */
  attach: {
    stage: (el: HTMLDivElement | null) => void;
    world: (el: HTMLDivElement | null) => void;
    champion: (el: HTMLDivElement | null) => void;
    dot: (el: HTMLDivElement | null) => void;
  };
  panelOpen: boolean;
  setPanelOpen: (open: boolean) => void;
  walkToStation: (id: StationId) => void;
  walkToPoint: (at: Pt) => void;
  walkToStop: (stop: CareerStop<Job>) => void;
  /** to a page at once, with the champion blinking to its place (the list of places, the keys) */
  goToPage: (page: PageKey) => void;
  /** opens Certificates with the slot of one certificate chosen */
  showCertificate: (id: string) => void;
  /** opens Resume at one role */
  showJob: (id: string) => void;
  steer: (direction: Direction, down: boolean) => void;
  recall: () => void;
  recalling: boolean;
  walkingTo: Station | null;
  /** the station the champion stands on, or `null` when it is somewhere else (walking, or a free spot) */
  standingAt: StationId | null;
  stops: CareerStop<Job>[];
  captured: ReadonlySet<string>;
  explored: Pt[];
  focus: Focus | null;
  clearFocus: () => void;
  ability: number | null;
  setAbility: (index: number | null) => void;
  /** where the champion is now, in map units (read when a cast or a ping starts: it is not state, a walk would render every frame) */
  getPosition: () => Pt;
  /** clears the fog of war within `radius` map units of `at` */
  reveal: (at: Pt, radius: number) => void;
}

const GameContext = createContext<GameValue | null>(null);

const cellOf = (p: Pt): string =>
  `${Math.floor(p.x / CELL)},${Math.floor(p.y / CELL)}`;
const centreOf = (key: string): Pt => {
  const [x, y] = key.split(',').map(Number);
  return { x: (x + 0.5) * CELL, y: (y + 0.5) * CELL };
};

/**
 * The game state of the Moba skin: where the champion is and how it walks, whether the page is open over the map, which towers of the
 * career have been taken and how much of the map has been seen. The champion is moved by a loop that runs only while it moves and writes
 * transforms straight to the elements, so a walk renders nothing in React.
 */
export function GameProvider({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const current: PageKey = page ?? 'home';
  const experience = useContentQuery('experience').data;
  const stops = useMemo(() => careerStops(experience ?? []), [experience]);

  const stage = useRef<HTMLDivElement | null>(null);
  const world = useRef<HTMLDivElement | null>(null);
  const champion = useRef<HTMLDivElement | null>(null);
  const dot = useRef<HTMLDivElement | null>(null);
  const attach = useMemo(
    () => ({
      stage: (el: HTMLDivElement | null) => {
        stage.current = el;
      },
      world: (el: HTMLDivElement | null) => {
        world.current = el;
      },
      champion: (el: HTMLDivElement | null) => {
        champion.current = el;
      },
      dot: (el: HTMLDivElement | null) => {
        dot.current = el;
      },
    }),
    [],
  );
  const loopRef = useRef<(now: number) => void>(() => undefined);
  const [view, setView] = useState<View>({ w: 1280, h: 800 });
  const [walker] = useState(() => new Walker(stationOfPage(current).at));
  const [panelOpen, setPanelOpenState] = useState(true);
  const [walkingTo, setWalkingTo] = useState<Station | null>(null);
  const [recalling, setRecalling] = useState(false);
  const [standingAt, setStandingAt] = useState<StationId | null>(
    () => stationOfPage(current).id,
  );
  const [focus, setFocus] = useState<Focus | null>(null);
  const [ability, setAbility] = useState<number | null>(null);
  const [captured, setCaptured] = useState<ReadonlySet<string>>(new Set());
  const [explored, setExplored] = useState<Pt[]>(() => [
    stationById('fountain').at,
  ]);

  const scale = scaleFor(view);
  const wide = isWide(view);

  // the loop reads these, so it never has to be restarted when they change
  const live = useRef({
    view,
    scale,
    panelOpen,
    current,
    stops,
    reduced,
    destination: null as Destination | null,
    raf: 0,
    last: 0,
    recall: 0 as unknown as ReturnType<typeof setTimeout>,
    flushed: 0,
  });
  useEffect(() => {
    Object.assign(live.current, {
      view,
      scale,
      panelOpen,
      current,
      stops,
      reduced,
    });
  });
  const seen = useRef(new Set<string>([cellOf(stationById('fountain').at)]));
  const taken = useRef(new Set<string>());
  const dirty = useRef(false);

  const apply = useCallback(() => {
    const { view: v, scale: k, panelOpen: open } = live.current;
    const pos = walker.pos;
    const camera = cameraOffset(pos, k, v, focusFor(v, open));
    const worldEl = world.current;
    if (worldEl)
      worldEl.style.transform = `translate3d(${camera.x}px, ${camera.y}px, 0)`;
    const heroEl = champion.current;
    if (heroEl)
      heroEl.style.transform = `translate3d(${pos.x * k}px, ${pos.y * k}px, 0)`;
    const dotEl = dot.current;
    if (dotEl) {
      dotEl.style.left = `${(pos.x / WORLD) * 100}%`;
      dotEl.style.top = `${(pos.y / WORLD) * 100}%`;
    }
  }, [walker]);

  const flushExplored = useCallback(() => {
    if (!dirty.current) return;
    dirty.current = false;
    live.current.flushed = performance.now();
    setExplored([...seen.current].map(centreOf));
  }, []);

  const getPosition = useCallback(() => walker.pos, [walker]);

  const reveal = useCallback(
    (at: Pt, radius: number) => {
      for (const key of cellsAround(at, radius, CELL))
        if (!seen.current.has(key)) {
          seen.current.add(key);
          dirty.current = true;
        }
      flushExplored();
    },
    [flushExplored],
  );

  const bookkeep = useCallback(() => {
    const pos = walker.pos;
    const key = cellOf(pos);
    if (!seen.current.has(key)) {
      seen.current.add(key);
      dirty.current = true;
    }
    for (const stop of live.current.stops) {
      const id = stop.job.id;
      if (!taken.current.has(id) && dist(stop.at, pos) < CAPTURE_RADIUS) {
        taken.current.add(id);
        setCaptured(new Set(taken.current));
      }
    }
    if (dirty.current && performance.now() - live.current.flushed > 280)
      flushExplored();
  }, [walker, flushExplored]);

  const go = useCallback(
    (target: PageKey) => {
      setPanelOpenState(true);
      if (target !== live.current.current) router.push(PAGE_META[target].href);
    },
    [router],
  );

  const arrive = useCallback(
    (destination: Destination | null) => {
      setWalkingTo(null);
      setStandingAt(
        STATIONS.find((s) => dist(s.at, walker.pos) < s.radius)?.id ?? null,
      );
      if (destination?.focus) setFocus(destination.focus);
      if (destination?.page) go(destination.page);
    },
    [go, walker],
  );

  const setMoving = useCallback((moving: boolean) => {
    if (moving) stage.current?.setAttribute('data-walking', '');
    else stage.current?.removeAttribute('data-walking');
  }, []);

  const finish = useCallback(() => {
    setMoving(false);
    bookkeep();
    flushExplored();
    // a champion walked by hand that stops on a place opens it, as stepping into it would
    const station = STATIONS.find((s) => dist(s.at, walker.pos) <= s.radius);
    if (station && station.page !== live.current.current)
      arrive({ page: station.page, station: station.id });
    else if (station) setPanelOpenState(true);
  }, [arrive, bookkeep, flushExplored, setMoving, walker]);

  const loop = useCallback(
    (now: number) => {
      const state = live.current;
      const seconds = Math.min(0.05, (now - state.last) / 1000);
      state.last = now;
      const wasWalking = walker.walking;
      const step = walker.tick(seconds);
      apply();
      bookkeep();
      if (step.arrived || (wasWalking && !walker.walking)) {
        const destination = state.destination;
        state.destination = null;
        state.raf = 0;
        setMoving(false);
        bookkeep();
        flushExplored();
        arrive(destination);
        return;
      }
      if (walker.walking || walker.steering) {
        state.raf = requestAnimationFrame((t) => loopRef.current(t));
      } else {
        state.raf = 0;
        finish();
      }
    },
    [apply, arrive, bookkeep, finish, flushExplored, setMoving, walker],
  );
  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const kick = useCallback(() => {
    const state = live.current;
    clearTimeout(state.recall);
    setRecalling(false);
    if (state.raf) return;
    state.last = performance.now();
    setMoving(true);
    state.raf = requestAnimationFrame((t) => loopRef.current(t));
  }, [setMoving]);

  useEffect(
    () => () => {
      cancelAnimationFrame(live.current.raf);
      clearTimeout(live.current.recall);
    },
    [],
  );

  const placeAt = useCallback(
    (at: Pt) => {
      cancelAnimationFrame(live.current.raf);
      live.current.raf = 0;
      live.current.destination = null;
      walker.place(at);
      setMoving(false);
      setWalkingTo(null);
      setStandingAt(STATIONS.find((s) => dist(s.at, at) < 1)?.id ?? null);
      apply();
      bookkeep();
      flushExplored();
    },
    [apply, bookkeep, flushExplored, setMoving, walker],
  );

  const walkTo = useCallback(
    (at: Pt, destination: Destination | null) => {
      if (live.current.reduced) {
        // no walking for a visitor who asked for less motion: the champion is there, and the page opens
        placeAt(at);
        arrive(destination);
        return;
      }
      walker.walk(routeTo(walker.pos, at));
      setStandingAt(null);
      live.current.destination = destination;
      setPanelOpenState(false);
      setAbility(null);
      setWalkingTo(
        destination?.station ? stationById(destination.station) : null,
      );
      kick();
    },
    [arrive, kick, placeAt, walker],
  );

  const walkToStation = useCallback(
    (id: StationId) => {
      const station = stationById(id);
      walkTo(station.at, { page: station.page, station: id });
    },
    [walkTo],
  );
  const walkToPoint = useCallback(
    (at: Pt) => walkTo(nearestWalkable(at), null),
    [walkTo],
  );
  const walkToStop = useCallback(
    (stop: CareerStop<Job>) =>
      walkTo(stop.at, {
        page: 'resume',
        focus: { kind: 'job', id: stop.job.id },
      }),
    [walkTo],
  );

  const goToPage = useCallback(
    (target: PageKey) => {
      setAbility(null);
      const station = STATIONS.find(
        (s) => s.page === target && dist(s.at, walker.pos) <= s.radius * 1.5,
      );
      if (!station) placeAt(stationOfPage(target).at);
      go(target);
    },
    [go, placeAt, walker],
  );

  const showCertificate = useCallback(
    (id: string) => {
      setFocus({ kind: 'certificate', id });
      goToPage('certificates');
    },
    [goToPage],
  );

  const showJob = useCallback(
    (id: string) => {
      setFocus({ kind: 'job', id });
      goToPage('resume');
    },
    [goToPage],
  );

  const steer = useCallback(
    (direction: Direction, down: boolean) => {
      walker.hold(direction, down);
      if (down) {
        setStandingAt(null);
        live.current.destination = null;
        setWalkingTo(null);
        setPanelOpenState(false);
        setAbility(null);
        kick();
      }
    },
    [kick, walker],
  );

  const recall = useCallback(() => {
    clearTimeout(live.current.recall);
    if (live.current.reduced) {
      goToPage('home');
      return;
    }
    setRecalling(true);
    live.current.recall = setTimeout(() => {
      setRecalling(false);
      goToPage('home');
    }, RECALL_MS);
  }, [goToPage]);

  const setPanelOpen = useCallback((open: boolean) => {
    setPanelOpenState(open);
    setAbility(null);
  }, []);

  // the page changed by something other than a walk (a link, the back button): the champion is at its place
  useEffect(() => {
    const here = STATIONS.some(
      (s) => s.page === current && dist(s.at, walker.pos) <= s.radius * 1.6,
    );
    // a new page only moves the champion (walker and elements, then the standing place): not a cascade, and `placeAt` is stable
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!here && !walker.walking) placeAt(stationOfPage(current).at);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  // the camera follows the champion when the window or the panel changes size
  useEffect(() => {
    apply();
  }, [apply, view, panelOpen, scale]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () =>
      setView((v) =>
        v.w === el.clientWidth && v.h === el.clientHeight
          ? v
          : { w: el.clientWidth, h: el.clientHeight },
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const value = useMemo<GameValue>(
    () => ({
      current,
      lost: page === null,
      view,
      wide,
      scale,
      attach,
      panelOpen,
      setPanelOpen,
      walkToStation,
      walkToPoint,
      walkToStop,
      goToPage,
      showCertificate,
      showJob,
      steer,
      recall,
      recalling,
      walkingTo,
      standingAt,
      stops,
      captured,
      explored,
      focus,
      clearFocus: () => setFocus(null),
      ability,
      setAbility,
      getPosition,
      reveal,
    }),
    [
      current,
      page,
      attach,
      view,
      wide,
      scale,
      panelOpen,
      setPanelOpen,
      walkToStation,
      walkToPoint,
      walkToStop,
      goToPage,
      showCertificate,
      showJob,
      steer,
      recall,
      recalling,
      walkingTo,
      standingAt,
      stops,
      captured,
      explored,
      focus,
      ability,
      getPosition,
      reveal,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameValue {
  const value = useContext(GameContext);
  if (!value) throw new Error('useGame must be used inside <GameProvider>');
  return value;
}

/** The callback ref of one of the elements the walker moves (`world`, `champion`, `dot`, `stage`). */
export function useAttach(
  name: keyof GameValue['attach'],
): (el: HTMLDivElement | null) => void {
  return useGame().attach[name];
}

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
import { useChat } from '@/components/chat/chat-provider';
import { useLive } from '@/hooks/use-live';
import { useGame } from '@/skins/moba/shell/game-context';
import { useReducedMotion } from '@/skins/moba/shell/use-reduced-motion';
import {
  CASTS,
  NOVA_RADIUS,
  aimFrom,
  type CastKind,
} from '@/skins/moba/world/abilities';
import type { Pt } from '@/skins/moba/world/geometry';
import { MAX_PINGS, PING_MS, type PingKind } from '@/skins/moba/world/pings';

/** One cast on its way over the map: a show, with the colour of the skill. */
export interface CastFx {
  id: number;
  kind: CastKind;
  from: Pt;
  to: Pt;
  angle: number;
  length: number;
  color: string;
}

export interface PingMark {
  id: number;
  kind: PingKind;
  at: Pt;
}

/** The ping wheel: where it is on the screen and which spot of the map it will ping. */
export interface Wheel {
  screen: Pt;
  at: Pt;
}

/** When a cooldown ends (a `performance.now()` time) and how long it is, so a bar can sweep for exactly that long. */
export interface Cooling {
  until: number;
  ms: number;
}

interface FxValue {
  casts: CastFx[];
  pings: PingMark[];
  cooling: Readonly<Record<number, Cooling>>;
  wheel: Wheel | null;
  /** the pointer over the map: where a cast or a ping is aimed (map units), and where the wheel opens (window pixels) */
  aimAt: (at: Pt, screen: Pt) => void;
  /** presses the key skill `slot`: a cast when it is ready, and the card that says what the skill is (a second press folds it) */
  pressSkill: (slot: number, color: string) => void;
  ping: (kind: PingKind, at: Pt) => void;
  openWheel: (at?: Pt, screen?: Pt) => void;
  closeWheel: () => void;
  /** the key that held the wheel open was let go: the slice under the pointer, if any, is chosen */
  releaseWheel: () => void;
  choose: (kind: PingKind) => void;
  /** told by the wheel: the ping the pointer is on, which a release of the key chooses */
  hover: (kind: PingKind | null) => void;
}

const FxContext = createContext<FxValue | null>(null);

const SHOW_MS = 1500;

/**
 * What the visitor does with the arena besides walking: casting the key skills (Q W E R) and pinging. A cast is a show over the map
 * plus a cooldown on its slot; a ping is a marker, and each ping of the wheel also does something real (see `world/pings.ts`). Nothing
 * here is data about the owner: the site's facts stay in the HUD and the pages.
 */
export function FxProvider({ children }: { children: ReactNode }) {
  const game = useGame();
  const chat = useChat();
  const live = useLive();
  const reduced = useReducedMotion();
  const [casts, setCasts] = useState<CastFx[]>([]);
  const [pings, setPings] = useState<PingMark[]>([]);
  const [cooling, setCooling] = useState<Record<number, Cooling>>({});
  const [wheel, setWheel] = useState<Wheel | null>(null);
  const aim = useRef<{ at: Pt; screen: Pt } | null>(null);
  const coolingNow = useRef<Record<number, Cooling>>({});
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const counter = useRef(0);
  const hovered = useRef<PingKind | null>(null);

  const later = useCallback((run: () => void, ms: number) => {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      run();
    }, ms);
    timers.current.add(timer);
  }, []);
  useEffect(() => {
    const all = timers.current;
    return () => {
      for (const timer of all) clearTimeout(timer);
    };
  }, []);

  const latest = useRef({ game, chat, features: live.features, reduced });
  useEffect(() => {
    latest.current = { game, chat, features: live.features, reduced };
  });

  const aimAt = useCallback((at: Pt, screen: Pt) => {
    aim.current = { at, screen };
  }, []);

  const cast = useCallback(
    (slot: number, color: string) => {
      const spec = CASTS[slot];
      const now = performance.now();
      if (!spec || (coolingNow.current[slot]?.until ?? 0) > now) return;
      const { game: g, reduced: still } = latest.current;
      const from = g.getPosition();
      const target = aimFrom(from, aim.current?.at ?? null, spec.range);
      const entry = { until: now + spec.cooldownMs, ms: spec.cooldownMs };
      coolingNow.current = { ...coolingNow.current, [slot]: entry };
      setCooling(coolingNow.current);
      later(() => {
        const rest = { ...coolingNow.current };
        delete rest[slot];
        coolingNow.current = rest;
        setCooling(rest);
      }, spec.cooldownMs);
      if (spec.kind === 'dash' && target.length > 8) g.walkToPoint(target.to);
      if (spec.kind === 'nova') g.reveal(from, NOVA_RADIUS);
      if (still) return;
      const id = ++counter.current;
      setCasts((list) => [
        ...list,
        { id, kind: spec.kind, from, color, ...target },
      ]);
      later(() => setCasts((list) => list.filter((c) => c.id !== id)), SHOW_MS);
    },
    [later],
  );

  const pressSkill = useCallback(
    (slot: number, color: string) => {
      const { game: g } = latest.current;
      if (g.ability === slot) {
        g.setAbility(null);
        return;
      }
      cast(slot, color);
      g.setAbility(slot);
    },
    [cast],
  );

  const ping = useCallback(
    (kind: PingKind, at: Pt) => {
      const id = ++counter.current;
      setPings((list) => [...list, { id, kind, at }].slice(-MAX_PINGS));
      later(() => setPings((list) => list.filter((p) => p.id !== id)), PING_MS);
    },
    [later],
  );

  const hover = useCallback((kind: PingKind | null) => {
    hovered.current = kind;
  }, []);

  const closeWheel = useCallback(() => {
    hovered.current = null;
    setWheel(null);
  }, []);

  const openWheel = useCallback((at?: Pt, screen?: Pt) => {
    const { game: g } = latest.current;
    const seen = aim.current;
    setWheel({
      at: at ?? seen?.at ?? g.getPosition(),
      screen: screen ??
        seen?.screen ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    });
  }, []);

  const choose = useCallback(
    (kind: PingKind) => {
      const { game: g, chat: c, features } = latest.current;
      const spot = wheel?.at ?? g.getPosition();
      closeWheel();
      if (kind === 'assist' && !features.chat) return;
      ping(kind, spot);
      if (kind === 'onMyWay') g.walkToPoint(spot);
      else if (kind === 'retreat') g.recall();
      else if (kind === 'assist') c.openChat();
    },
    [closeWheel, ping, wheel],
  );

  const releaseWheel = useCallback(() => {
    const kind = hovered.current;
    if (kind) choose(kind);
  }, [choose]);

  const value = useMemo<FxValue>(
    () => ({
      casts,
      pings,
      cooling,
      wheel,
      aimAt,
      pressSkill,
      ping,
      openWheel,
      closeWheel,
      releaseWheel,
      choose,
      hover,
    }),
    [
      casts,
      pings,
      cooling,
      wheel,
      aimAt,
      pressSkill,
      ping,
      openWheel,
      closeWheel,
      releaseWheel,
      choose,
      hover,
    ],
  );
  return <FxContext.Provider value={value}>{children}</FxContext.Provider>;
}

export function useFx(): FxValue {
  const value = useContext(FxContext);
  if (!value) throw new Error('useFx must be used inside <FxProvider>');
  return value;
}

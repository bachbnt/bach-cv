/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { toWorld } from '@/skins/travel/map/iso';
import {
  roadBetween,
  ROUTE_LENGTH,
  type PlacedStop,
} from '@/skins/travel/map/route';
import type { Plane } from '@/skins/travel/map/projection';

/** The way from one stop to the next along the real road: the road to where the side trip leaves it, then the spur. */
export function tripPath(from: PlacedStop, to: PlacedStop): Plane[] {
  const out: Plane[] = [];
  if (from.side) out.push(from.at, from.from);
  out.push(...roadBetween(from.t, to.t));
  if (to.side) out.push(to.at);
  return out.length > 1 ? out : [from.at, to.at];
}

const MS_PER_KM = 260;

/**
 * The traveller: the owner's photo in a pin, riding along the road to the stop that is open (the Web Animations API moves it, so it
 * runs on the compositor and ends at once for reduced motion). It rests at the stop; it never works out any data.
 */
export function Traveller({
  stops,
  activeId,
  avatar,
  name,
  reduced,
}: {
  stops: readonly { id: string; placed: PlacedStop }[];
  activeId: string | null;
  avatar: string;
  name: string;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<PlacedStop | null>(null);
  const [moving, setMoving] = useState(false);
  const target =
    stops.find((s) => s.id === activeId)?.placed ??
    stops[stops.length - 1]?.placed;

  useEffect(() => {
    const element = ref.current;
    if (!element || !target) return;
    const place = (p: Plane) => {
      const w = toWorld(p);
      element.style.transform = `translate(${w.x}px, ${w.y}px)`;
    };
    const from = last.current;
    last.current = target;
    if (!from || reduced || from === target) {
      place(target.at);
      return;
    }
    const path = tripPath(from, target);
    const lengths = path.map((p, i) =>
      i ? Math.hypot(p.x - path[i - 1].x, p.y - path[i - 1].y) : 0,
    );
    const total = lengths.reduce((a, b) => a + b, 0) || 1;
    let done = 0;
    const frames = path.map((p, i) => {
      done += lengths[i];
      const w = toWorld(p);
      return {
        transform: `translate(${w.x}px, ${w.y}px)`,
        offset: done / total,
      };
    });
    const km = (total / ROUTE_LENGTH) * 11;
    const animation = element.animate(frames, {
      duration: Math.min(5200, Math.max(900, km * MS_PER_KM)),
      easing: 'ease-in-out',
      fill: 'forwards',
    });
    setMoving(true);
    animation.finished
      .then(() => {
        place(target.at);
        animation.cancel();
      })
      .catch(() => undefined)
      .finally(() => setMoving(false));
    return () => animation.cancel();
  }, [target, reduced]);

  return (
    <div
      ref={ref}
      aria-hidden='true'
      className='tl-traveller'
      style={{ zIndex: 5000 }}
    >
      <div className={moving ? 'tl-traveller-in tl-moving' : 'tl-traveller-in'}>
        <span className='tl-traveller-badge'>
          <Image src={avatar} alt='' width={46} height={46} />
        </span>
        <span className='tl-traveller-tag'>{name}</span>
      </div>
    </div>
  );
}

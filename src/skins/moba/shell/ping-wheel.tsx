/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { AlertTriangle, Footprints, LifeBuoy, Undo2 } from 'lucide-react';
import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { mobaCopy } from '@/content/copy/moba';
import { useLive } from '@/hooks/use-live';
import { useCopy } from '@/lib/i18n/copy';
import { useFx } from '@/skins/moba/shell/fx-context';
import {
  PINGS,
  WHEEL_RADIUS,
  sliceAt,
  slicePoint,
  type PingKind,
} from '@/skins/moba/world/pings';

const ICONS = {
  alert: AlertTriangle,
  onMyWay: Footprints,
  retreat: Undo2,
  assist: LifeBuoy,
} as const satisfies Record<PingKind, unknown>;

/** The wheel keeps this far from the edge of the window, so none of its pings is cut off. */
const EDGE = WHEEL_RADIUS + 44;

/**
 * The ping wheel: hold V (or press and hold on the map with a finger) and let go on a ping, or press V and pick one with the arrow keys,
 * Tab, or a click. It opens on the pointer, a ping is a marker on the map, and each one does something that the site also has as a
 * button: walk there, open the BB Bot chat, recall, or just mark the spot.
 */
export function PingWheel() {
  const copy = useCopy(mobaCopy).ping;
  const live = useLive();
  const { wheel, choose, closeWheel, hover } = useFx();
  const root = useRef<HTMLDivElement>(null);
  const before = useRef<Element | null>(null);

  useEffect(() => {
    if (!wheel) return;
    before.current = document.activeElement;
    // the wheel itself takes the focus (it has no ring), so the first arrow key or Tab reaches the pings
    root.current?.focus();
    return () => {
      if (before.current instanceof HTMLElement) before.current.focus();
    };
  }, [wheel]);

  if (!wheel) return null;
  const x = Math.min(Math.max(wheel.screen.x, EDGE), window.innerWidth - EDGE);
  const y = Math.min(Math.max(wheel.screen.y, EDGE), window.innerHeight - EDGE);

  const track = (event: PointerEvent<HTMLDivElement>) => {
    const index = sliceAt(event.clientX - x, event.clientY - y, PINGS.length);
    const kind = index === null ? null : PINGS[index];
    hover(kind);
    root.current
      ?.querySelectorAll<HTMLElement>('[role="menuitem"]')
      .forEach((item) =>
        item.toggleAttribute('data-active', item.dataset.ping === kind),
      );
  };
  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeWheel();
      return;
    }
    const step = (
      { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<
        string,
        number
      >
    )[event.key];
    if (!step) return;
    event.preventDefault();
    const items = [
      ...(root.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ??
        []),
    ];
    const at = items.indexOf(document.activeElement as HTMLElement);
    items[(at + step + items.length) % items.length]?.focus();
  };

  return (
    <>
      <div
        className='absolute inset-0 z-[55]'
        onPointerDown={closeWheel}
        onPointerMove={track}
        aria-hidden='true'
      />
      <div
        ref={root}
        role='menu'
        aria-label={copy.label}
        tabIndex={-1}
        className='mb-wheel absolute z-[56] size-0 outline-none'
        style={{ left: x, top: y }}
        onPointerMove={track}
        onKeyDown={keys}
      >
        <span className='mb-wheel-ring' aria-hidden='true' />
        {PINGS.map((kind, i) => {
          const at = slicePoint(i, PINGS.length);
          const Icon = ICONS[kind];
          const off = kind === 'assist' && !live.features.chat;
          return (
            <div
              key={kind}
              className='absolute -translate-x-1/2 -translate-y-1/2'
              style={{ left: at.x, top: at.y }}
            >
              <button
                type='button'
                role='menuitem'
                data-ping={kind}
                aria-disabled={off || undefined}
                aria-label={copy[kind]}
                className='mb-slot mb-wheel-item size-[54px] max-[719px]:size-12'
                onClick={() => !off && choose(kind)}
                onPointerEnter={() => hover(kind)}
              >
                <span className='mb-slot-in text-mb-title'>
                  <Icon aria-hidden='true' className='size-6' />
                </span>
              </button>
              <span className='mb-wheel-label' aria-hidden='true'>
                {copy[kind]}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

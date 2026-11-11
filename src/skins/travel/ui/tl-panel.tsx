/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { travelShellCopy } from '@/content/copy/travel-shell';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TlFooter } from '@/skins/travel/ui/tl-footer';
import {
  draggedHeight,
  restsTall,
  SHEET_SHORT,
  SHEET_TALL,
  SLOP,
} from '@/skins/travel/ui/sheet-snap';

/** The card stops 24 px above the bottom of the map, which keeps the map credit (a line at the bottom left) clear. */
const SIDE = {
  left: 'md:top-4 md:left-4 md:w-[min(420px,calc(100%-100px))] md:max-h-[calc(100%-2.5rem)]',
  right:
    'md:top-4 md:right-[78px] md:w-[min(440px,calc(100%-100px))] md:max-h-[calc(100%-2.5rem)]',
  wide: 'md:right-[78px] md:bottom-7 md:left-4 md:max-h-[calc(100%-2.5rem)]',
} as const;

/**
 * The page's card over the map. On a wide screen it floats at the left, the right or along the bottom; on a phone it is a sheet that
 * rises from the bottom with a handle that makes it taller or shorter, so the map above stays in view: a tap (or Enter, or Space) on the
 * handle switches between the two heights, and a finger on it drags the sheet, which follows it and comes to rest at the nearer height
 * (or the one a flick was thrown to). The page inside keeps its own heading; the sheet is a `section` named by it. The line of the
 * rights ends the scrolling part, as Standard's footer does. The two heights are `SHEET_SHORT` and `SHEET_TALL` of the map, said in the
 * classes below too.
 */
export function TlPanel({
  side,
  labelledBy,
  className,
  children,
}: {
  side: keyof typeof SIDE;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const words = useCopy(travelShellCopy).panel;
  const [tall, setTall] = useState(false);
  const sheet = useRef<HTMLElement>(null);
  // the drag that is under way: where it began, the two heights in px, whether it has gone past a tap, and the last few places of the finger
  const drag = useRef<{
    id: number;
    startY: number;
    startHeight: number;
    short: number;
    tall: number;
    moved: boolean;
    trail: { y: number; t: number }[];
  } | null>(null);
  // the click that a drag ends with is not a tap on the handle
  const dragged = useRef(false);

  const grab = (event: PointerEvent<HTMLButtonElement>) => {
    const element = sheet.current;
    const map = element?.parentElement;
    if (
      !element ||
      !map ||
      (event.pointerType === 'mouse' && event.button !== 0)
    )
      return;
    const area = map.getBoundingClientRect().height;
    drag.current = {
      id: event.pointerId,
      startY: event.clientY,
      startHeight: element.getBoundingClientRect().height,
      short: area * SHEET_SHORT,
      tall: area * SHEET_TALL,
      moved: false,
      trail: [{ y: event.clientY, t: event.timeStamp }],
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event: PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    const element = sheet.current;
    if (!current || !element || current.id !== event.pointerId) return;
    const rise = current.startY - event.clientY;
    if (!current.moved) {
      if (Math.abs(rise) < SLOP) return;
      current.moved = true;
      element.setAttribute('data-dragging', '');
    }
    current.trail.push({ y: event.clientY, t: event.timeStamp });
    // only the last 100 ms say how fast the finger was going when it let go
    while (
      current.trail.length > 2 &&
      event.timeStamp - current.trail[0].t > 100
    )
      current.trail.shift();
    element.style.height = `${draggedHeight(current.startHeight, rise, current.short, current.tall)}px`;
  };

  const release = (event: PointerEvent<HTMLButtonElement>) => {
    const current = drag.current;
    const element = sheet.current;
    drag.current = null;
    if (
      !current ||
      !element ||
      current.id !== event.pointerId ||
      !current.moved
    )
      return;
    dragged.current = true;
    window.setTimeout(() => {
      dragged.current = false;
    }, 50);
    const height = draggedHeight(
      current.startHeight,
      current.startY - event.clientY,
      current.short,
      current.tall,
    );
    const first = current.trail[0];
    const last = current.trail[current.trail.length - 1];
    const velocity =
      event.type === 'pointercancel' || last.t === first.t
        ? 0
        : (first.y - last.y) / (last.t - first.t);
    const rests = restsTall(height, velocity, current.short, current.tall);
    setTall(rests);
    // the sheet glides from where it was let go to the height it rests at, and then the classes (a share of the map) take over again
    element.removeAttribute('data-dragging');
    element.style.height = `${rests ? current.tall : current.short}px`;
    const settle = () => element.style.removeProperty('height');
    element.addEventListener(
      'transitionend',
      (end) => {
        if (end.target === element && end.propertyName === 'height') settle();
      },
      { once: true },
    );
    window.setTimeout(settle, 450);
  };

  return (
    <section
      ref={sheet}
      aria-labelledby={labelledBy}
      data-tall={tall || undefined}
      className={cn(
        'tl-panel tl-rise pointer-events-auto absolute right-0 bottom-0 left-0 flex min-h-0 flex-col overflow-hidden rounded-t-[26px] border border-tl-line bg-tl-panel shadow-tl-card transition-[height] duration-300 max-md:h-[46%] max-md:data-[dragging]:transition-none max-md:data-[tall]:h-[88%] md:absolute md:right-auto md:bottom-auto md:left-auto md:h-auto md:rounded-3xl',
        SIDE[side],
        className,
      )}
    >
      <button
        type='button'
        aria-expanded={tall}
        aria-label={tall ? words.collapse : words.expand}
        onClick={() => {
          if (dragged.current) return;
          setTall((v) => !v);
        }}
        onPointerDown={grab}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
        className='flex min-h-11 w-full flex-none cursor-pointer touch-none items-center justify-center gap-1 pt-2 pb-1 select-none md:hidden'
      >
        <i
          aria-hidden='true'
          className='h-[5px] w-11 rounded-[3px] bg-tl-muted opacity-60'
        />
        {tall ? (
          <ChevronDown aria-hidden='true' className='size-4 text-tl-muted' />
        ) : (
          <ChevronUp aria-hidden='true' className='size-4 text-tl-muted' />
        )}
      </button>
      <div className='tl-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain'>
        {children}
        <TlFooter />
      </div>
    </section>
  );
}

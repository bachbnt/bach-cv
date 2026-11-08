/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { cn } from '@/lib/utils';

/** How far an arrow key moves a splitter, and how far with Shift. */
const STEP = 24;
const BIG_STEP = 96;

/**
 * A draggable divider between two parts of the terminal, as in a chart terminal: a real separator (focusable, with its value and its
 * limits) that moves with the mouse or a finger and with the arrow keys, goes to its limits with Home and End and back to the usual
 * size with Enter or a double click. `value` is the size of the part it resizes, in pixels; `grow` is 1 when moving the pointer right
 * or down makes that part bigger and -1 when it makes it smaller. While it is dragged the pointer is captured, the page does not
 * select text, and the new size is passed on at most once for each animation frame.
 */
export function Splitter({
  orientation,
  label,
  value,
  min,
  max,
  grow = 1,
  className,
  style,
  onChange,
  onReset,
}: {
  orientation: 'horizontal' | 'vertical';
  label: string;
  value: number;
  min: number;
  max: number;
  grow?: 1 | -1;
  className?: string;
  style?: CSSProperties;
  /** a new size (`final` when the drag ended or a key was pressed) */
  onChange: (size: number, final: boolean) => void;
  onReset: () => void;
}) {
  const drag = useRef<{ from: number; size: number; next: number } | null>(
    null,
  );
  const frame = useRef(0);
  const vertical = orientation === 'vertical';
  const clamp = (size: number) => Math.min(max, Math.max(min, size));

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const coordinate = (event: PointerEvent) =>
    vertical ? event.clientX : event.clientY;

  const flush = () => {
    frame.current = 0;
    const d = drag.current;
    if (d) onChange(d.next, false);
  };

  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { from: coordinate(event), size: value, next: value };
    document.body.style.userSelect = 'none';
    document.body.style.cursor = vertical ? 'col-resize' : 'row-resize';
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    d.next = clamp(d.size + grow * (coordinate(event) - d.from));
    if (!frame.current) frame.current = requestAnimationFrame(flush);
  };
  const end = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    onChange(d.next, true);
  };

  const key = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? BIG_STEP : STEP;
    const less = vertical ? 'ArrowLeft' : 'ArrowUp';
    const more = vertical ? 'ArrowRight' : 'ArrowDown';
    let next: number | null = null;
    // the arrows move the divider, so the size of the part it resizes goes up or down with the direction of `grow`
    if (event.key === less) next = value - grow * step;
    else if (event.key === more) next = value + grow * step;
    else if (event.key === 'Home') next = grow === 1 ? min : max;
    else if (event.key === 'End') next = grow === 1 ? max : min;
    else if (event.key === 'Enter') {
      event.preventDefault();
      onReset();
      return;
    }
    if (next === null) return;
    event.preventDefault();
    onChange(clamp(next), true);
  };

  return (
    <div
      role='separator'
      aria-orientation={orientation}
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={Math.round(min)}
      aria-valuemax={Math.round(max)}
      tabIndex={0}
      data-splitter={orientation}
      style={style}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      onDoubleClick={onReset}
      onKeyDown={key}
      className={cn(
        // 7px is easy for a mouse; a finger gets a 44px target through the pseudo-element (the handle stays where it is, the target is
        // centred on it), which takes the pointer for the handle
        'group/split z-20 touch-none outline-none select-none after:absolute after:content-[""] max-[1100px]:hidden',
        vertical
          ? 'w-[7px] cursor-col-resize pointer-coarse:after:inset-y-0 pointer-coarse:after:-inset-x-[19px]'
          : 'h-[7px] cursor-row-resize pointer-coarse:after:inset-x-0 pointer-coarse:after:-inset-y-[19px]',
        className,
      )}
    >
      <span
        aria-hidden='true'
        className={cn(
          'pointer-events-none absolute bg-transparent transition-colors group-hover/split:bg-tv-accent/60 group-focus-visible/split:bg-tv-accent group-active/split:bg-tv-accent',
          vertical
            ? 'inset-y-0 left-[2px] w-[3px]'
            : 'inset-x-0 top-[2px] h-[3px]',
        )}
      />
    </div>
  );
}

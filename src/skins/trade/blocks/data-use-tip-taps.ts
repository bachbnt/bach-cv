/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, type MouseEvent, type PointerEvent } from 'react';

/** A tap that follows the focus of the same tap is ignored for this long (ms), as in the Standard chip. */
const TAP_GRACE = 350;

/**
 * The events of an element that shows a tip, with the behaviour of the Standard skill chip: hover and keyboard focus show it; on
 * touch the first tap shows it (its own focus does) and a second tap hides it. `onPress` runs for every click (a pin, for example).
 */
export function useTipEvents({
  active,
  onShow,
  onHide,
  onPress,
}: {
  active: boolean;
  onShow: (element: HTMLElement) => void;
  onHide: () => void;
  onPress?: () => void;
}) {
  const pointer = useRef('mouse');
  const shownAt = useRef(0);
  const show = (element: HTMLElement) => {
    shownAt.current = Date.now();
    onShow(element);
  };
  return {
    onMouseEnter: (e: MouseEvent<HTMLElement>) => show(e.currentTarget),
    onMouseLeave: onHide,
    onFocus: (e: { currentTarget: HTMLElement }) => show(e.currentTarget),
    onBlur: onHide,
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      pointer.current = e.pointerType;
    },
    onClick: (e: MouseEvent<HTMLElement>) => {
      onPress?.();
      if (
        pointer.current !== 'touch' ||
        Date.now() - shownAt.current < TAP_GRACE
      )
        return;
      if (active) onHide();
      else show(e.currentTarget);
    },
  };
}

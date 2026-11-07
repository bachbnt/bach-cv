/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { placeTip } from '@/components/skills/skill-text';

export const SKILL_TIP_ID = 'mb-skill-tip';

export interface ActiveTip {
  id: string;
  text: string;
  rect: { left: number; top: number; width: number; bottom: number };
}

/**
 * The tooltip of a skill tile: one element for the whole section, placed over the tile (under it when there is no room) by the pure
 * `placeTip` of Standard. It lives in `body` with fixed coordinates, so the scrolling panel and the cut corners of a card never clip it.
 */
export function ResumeSkillTip({ tip }: { tip: ActiveTip }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const place = placeTip(
      tip.rect,
      { width: el.offsetWidth, height: el.offsetHeight },
      document.documentElement.clientWidth,
    );
    el.style.left = `${place.left}px`;
    el.style.top = `${place.top}px`;
    el.style.setProperty('--ax', `${place.arrow}px`);
    el.dataset.below = String(place.below);
    el.style.visibility = 'visible';
  }, [tip]);

  return createPortal(
    <div
      ref={ref}
      id={SKILL_TIP_ID}
      role='tooltip'
      style={{ visibility: 'hidden' }}
      className='mb-card mb-tip pointer-events-none fixed z-[85] max-w-[min(270px,calc(100vw-16px))] px-3.5 py-2.5 font-[family-name:var(--mb-font)] text-[13.5px] leading-[1.45] font-medium text-mb-ink'
    >
      {tip.text}
    </div>,
    document.body,
  );
}

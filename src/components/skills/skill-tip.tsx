/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { placeTip } from '@/components/skills/skill-text';

export const SKILL_TIP_ID = 'skill-tip';

export interface ActiveTip {
  id: string;
  text: string;
  rect: { left: number; top: number; width: number; bottom: number };
}

/**
 * The tooltip over a skill chip: one element for the whole section, placed above the chip
 * (below when there is no room). It sits in `body` and uses fixed coordinates, so no card clips it.
 */
export function SkillTip({ tip }: { tip: ActiveTip }) {
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
      className="pointer-events-none fixed z-80 max-w-[min(260px,calc(100vw-16px))] rounded-[10px] bg-night px-[13px] py-[9px] text-[13.5px] leading-[1.45] font-medium text-white shadow-[0_10px_24px_rgba(27,31,39,.28)] after:absolute after:bottom-[-5px] after:left-[var(--ax,50%)] after:-ml-[5px] after:size-2.5 after:rotate-45 after:bg-night after:content-[''] data-[below=true]:after:top-[-5px] data-[below=true]:after:bottom-auto motion-safe:animate-in motion-safe:duration-150 motion-safe:fade-in-0"
    >
      {tip.text}
    </div>,
    document.body,
  );
}

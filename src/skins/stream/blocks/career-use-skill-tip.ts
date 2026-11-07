/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { SKILL_TIP_ID, type ActiveTip } from '@/components/skills/skill-tip';
import { tipText, type TipCopy } from '@/components/skills/skill-text';
import type { Doc, SkillEvidence } from '@/lib/content/schema';

/** A tap that follows the focus of the same tap is ignored for this long (ms). */
const TAP_GRACE = 350;

/**
 * The tip of the skills, with the behaviour of Standard's chips: hover and keyboard focus show it, on touch the first tap shows it and a
 * second hides it, and a tap elsewhere, Escape, a scroll or a resize hide it. One tip at a time, so the whole section owns it.
 * `props(skill)` is what a button of a skill needs.
 */
export function useSkillTip(
  evidence: ReadonlyMap<string, SkillEvidence>,
  copy: TipCopy,
) {
  const [tip, setTip] = useState<ActiveTip | null>(null);
  const pointer = useRef('mouse');
  const shownAt = useRef(0);
  const hide = useCallback(() => setTip(null), []);

  useEffect(() => {
    if (!tip) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-skill-chip]')) hide();
    };
    addEventListener('keydown', onKey);
    addEventListener('scroll', hide, { passive: true });
    addEventListener('resize', hide);
    document.addEventListener('click', onClick);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('scroll', hide);
      removeEventListener('resize', hide);
      document.removeEventListener('click', onClick);
    };
  }, [tip, hide]);

  const show = (skill: Doc<'skills'>, element: HTMLElement) => {
    shownAt.current = Date.now();
    const r = element.getBoundingClientRect();
    setTip({
      id: skill.id,
      text: tipText(evidence.get(skill.id), copy),
      rect: { left: r.left, top: r.top, width: r.width, bottom: r.bottom },
    });
  };

  return {
    tip,
    props: (skill: Doc<'skills'>) => ({
      'data-skill-chip': '',
      'aria-describedby': tip?.id === skill.id ? SKILL_TIP_ID : undefined,
      onMouseEnter: (e: ReactMouseEvent<HTMLElement>) =>
        show(skill, e.currentTarget),
      onMouseLeave: hide,
      onFocus: (e: ReactFocusEvent<HTMLElement>) =>
        show(skill, e.currentTarget),
      onBlur: hide,
      onPointerDown: (e: ReactPointerEvent) => {
        pointer.current = e.pointerType;
      },
      onClick: (e: ReactMouseEvent<HTMLElement>) => {
        // mouse and keyboard are handled by hover and focus; on touch the tap's own focus has just shown the tip
        if (
          pointer.current !== 'touch' ||
          Date.now() - shownAt.current < TAP_GRACE
        )
          return;
        if (tip?.id === skill.id) hide();
        else show(skill, e.currentTarget);
      },
    }),
  };
}

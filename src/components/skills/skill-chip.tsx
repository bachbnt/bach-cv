/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_TIP_ID } from '@/components/skills/skill-tip';
import type { Skill } from '@/lib/content/schema';
import { cn } from 'cn';

const TONE: Record<Skill['category'], string> = {
  mobile: 'bg-mobile text-mobile-foreground',
  web: 'bg-web text-web-foreground',
  ai: 'bg-ai text-ai-foreground',
  tools: 'bg-tools text-tools-foreground',
};

/** A tap that follows the focus of the same tap is ignored for this long (ms). */
const TAP_GRACE = 350;

/**
 * A skill as a coloured chip. Hover and keyboard focus show its tip; on touch the first tap shows it
 * and a second tap hides it. Tapping elsewhere, scrolling or Escape also hide it (see `SkillGroups`).
 */
export function SkillChip({
  skill,
  core,
  active,
  onShow,
  onHide,
}: {
  skill: Skill & { id: string };
  core: boolean;
  active: boolean;
  onShow: (element: HTMLElement) => void;
  onHide: () => void;
}) {
  const pointer = useRef('mouse');
  const shownAt = useRef(0);

  const show = (element: HTMLElement) => {
    shownAt.current = Date.now();
    onShow(element);
  };

  return (
    <button
      type='button'
      data-skill-chip=''
      aria-describedby={active ? SKILL_TIP_ID : undefined}
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={onHide}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={onHide}
      onPointerDown={(e) => {
        pointer.current = e.pointerType;
      }}
      onClick={(e) => {
        // mouse and keyboard are handled by hover and focus; on touch the tap's own focus has just shown the tip
        if (
          pointer.current !== 'touch' ||
          Date.now() - shownAt.current < TAP_GRACE
        )
          return;
        if (active) onHide();
        else show(e.currentTarget);
      }}
      className={cn(
        'inline-flex cursor-help items-center gap-[7px] rounded-full px-3 py-1.5 text-[14.5px] outline-offset-2 transition-[filter] active:brightness-95 pointer-coarse:min-h-11',
        TONE[skill.category],
        core ? 'font-bold' : 'font-medium',
      )}
    >
      <SkillIcon
        icon={skill.icon}
        name={skill.name}
        className='size-[15px] flex-none'
      />
      {skill.name}
    </button>
  );
}

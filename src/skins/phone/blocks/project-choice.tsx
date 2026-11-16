/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SkillHue } from '@/skins/phone/blocks/skill-hue';

/** The fill and the text of a choice that has a hue (spelled out so the build finds the classes). */
const HUED: Record<SkillHue, string> = {
  blue: 'bg-ph-tag-blue text-ph-tag-blue-ink',
  green: 'bg-ph-tag-green text-ph-tag-green-ink',
  violet: 'bg-ph-tag-violet text-ph-tag-violet-ink',
  amber: 'bg-ph-tag-amber text-ph-tag-amber-ink',
};

/**
 * One choice of a filter: the word and, in small type, how many projects it would show ("Mobile, 4" for a reader of the screen). A choice that
 * is on has a check as well as the accent, and one that would show nothing is quiet.
 */
export function ProjectChoice({
  label,
  count,
  pressed,
  hue,
  onClick,
}: {
  label: string;
  count?: number;
  pressed: boolean;
  /** the hue of the area of a technology: it tints the choice while it is off, and the accent still says that it is on */
  hue?: SkillHue;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      aria-pressed={pressed}
      aria-label={count === undefined ? undefined : `${label}, ${count}`}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 min-w-11 cursor-pointer items-center justify-center gap-1.5 rounded-full border-[1.5px] px-4 text-[15px] leading-none font-semibold transition-[scale,background-color,border-color] duration-100 select-none active:scale-[0.97] pointer-coarse:h-11',
        pressed
          ? 'border-ph-accent bg-ph-accent/15 text-ph-accent-ink'
          : cn(
              'border-transparent',
              hue ? HUED[hue] : 'bg-ph-sheet-3 text-ph-ink hover:bg-ph-line',
            ),
      )}
    >
      {pressed && (
        <Check aria-hidden='true' className='size-4' strokeWidth={3} />
      )}
      {label}
      {count !== undefined && (
        <span
          aria-hidden='true'
          className={cn(
            'text-[13px] font-medium tabular-nums',
            pressed
              ? 'text-ph-accent-ink'
              : hue
                ? 'opacity-80'
                : 'text-ph-mute',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { CSSProperties } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { SKILL_TIP_ID } from '@/components/skills/skill-tip';
import type { Skill } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { useTipEvents } from '@/skins/trade/blocks/data-use-tip-taps';

/**
 * A skill as a tile with the behaviour of the Standard chip: hover and keyboard focus show its tip; on touch the first tap shows it and
 * a second tap hides it (a tap elsewhere, a scroll or Escape hide it too, see `useSkillTip`). `line` is the "Used at ..." line a core
 * tile shows.
 */
export function DataSkillTile({
  skill,
  core,
  line,
  active,
  index,
  onShow,
  onHide,
}: {
  skill: Skill & { id: string };
  core: boolean;
  /** only the large tile of the core stack has one */
  line?: string;
  active: boolean;
  index: number;
  onShow: (element: HTMLElement) => void;
  onHide: () => void;
}) {
  const events = useTipEvents({ active, onShow, onHide });
  const color = SKILL_COLORS[skill.icon];
  const large = line !== undefined;

  return (
    <button
      type='button'
      data-skill-chip=''
      aria-describedby={active ? SKILL_TIP_ID : undefined}
      style={
        {
          '--i': Math.min(index, 14),
          ...(color ? { '--c': color } : {}),
        } as CSSProperties
      }
      {...events}
      className={cn(
        'flex animate-[tv-pop_0.35s_cubic-bezier(0.2,0.7,0.2,1)_both] cursor-help items-center gap-2 rounded border border-tv-line border-l-2 border-l-(--c,var(--tv-accent)) bg-tv-panel text-left transition-[background-color,translate] duration-150 [animation-delay:calc(var(--i)*30ms)] hover:-translate-y-px hover:bg-tv-hover active:translate-y-0 active:bg-tv-hover data-[active=true]:bg-tv-hover pointer-coarse:min-h-11',
        large ? 'items-start p-2.5' : 'h-8 px-2.5',
        core ? 'font-bold' : 'font-medium',
      )}
      data-active={active}
    >
      <span
        className={cn(
          'grid flex-none place-items-center rounded bg-[color-mix(in_srgb,var(--c,var(--tv-accent))_16%,transparent)] text-[color-mix(in_srgb,var(--c,var(--tv-accent))_70%,var(--tv-ink))]',
          large ? 'size-8' : 'size-5',
        )}
      >
        <SkillIcon
          icon={skill.icon}
          name={skill.name}
          className={large ? 'size-5 text-sm' : 'size-3.5 text-[10px]'}
        />
      </span>
      <span className='min-w-0'>
        <span
          className={cn(
            'block leading-tight',
            large ? 'text-[13px]' : 'text-xs',
          )}
        >
          {skill.name}
        </span>
        {line && (
          <span className='mt-0.5 block text-xs/[1.4] font-normal text-tv-mute'>
            {line}
          </span>
        )}
      </span>
    </button>
  );
}

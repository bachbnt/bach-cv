/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { tipText } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { SKILL_CATEGORIES, type Skill } from '@/lib/content/schema';
import { listedSkills } from '@/lib/derive/core-skills';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  SKILL_TIP_ID,
  ResumeSkillTip,
  type ActiveTip,
} from '@/skins/moba/blocks/resume-skill-tip';
import { MbCard } from '@/skins/moba/ui/mb-card';
import { MbDataState } from '@/skins/moba/ui/mb-data-state';
import { MbSkeleton } from '@/skins/moba/ui/mb-skeleton';

/** AI first, then the rest: the order Standard shows the areas in. */
const ORDER = [
  'ai',
  'mobile',
  'web',
  'tools',
] as const satisfies readonly (typeof SKILL_CATEGORIES)[number][];

/** The colour of the stripe of a tile and of the dot of its area: the pair tokens of Standard, mapped to the skin. */
const TONE: Record<(typeof ORDER)[number], string> = {
  ai: 'text-ai-foreground',
  mobile: 'text-mobile-foreground',
  web: 'text-web-foreground',
  tools: 'text-tools-foreground',
};

/** A tap that follows the focus of the same tap is ignored for this long (ms). */
const TAP_GRACE = 350;

/** The box of a tile, as the tip needs it. */
const rectOf = (element: HTMLElement): ActiveTip['rect'] => {
  const r = element.getBoundingClientRect();
  return { left: r.left, top: r.top, width: r.width, bottom: r.bottom };
};

/** Whether the tile is still inside the area that scrolls it (the page panel), or inside the window when there is none. */
const inView = (element: HTMLElement): boolean => {
  const r = element.getBoundingClientRect();
  const area = element.closest('.mb-panel-scroll')?.getBoundingClientRect() ?? {
    top: 0,
    bottom: window.innerHeight,
  };
  return r.top >= area.top && r.bottom <= area.bottom;
};

/** One skill as an item tile: hover and keyboard focus show its tip; on touch the first tap shows it and a second tap hides it. */
function SkillTile({
  skill,
  active,
  onShow,
  onHide,
}: {
  skill: Skill;
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
  const core = skill.highlight !== null;
  return (
    <button
      type='button'
      data-skill-chip=''
      data-core={core ? '' : undefined}
      aria-describedby={active ? SKILL_TIP_ID : undefined}
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={onHide}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={onHide}
      onPointerDown={(e) => {
        pointer.current = e.pointerType;
      }}
      onClick={(e) => {
        // mouse and keyboard are handled by hover and focus; on touch the focus of the same tap has just shown the tip
        if (
          pointer.current !== 'touch' ||
          Date.now() - shownAt.current < TAP_GRACE
        )
          return;
        if (active) onHide();
        else show(e.currentTarget);
      }}
      className={cn(
        'mb-tile inline-flex min-h-9 cursor-help items-center gap-2 px-2.5 py-1.5 text-[13.5px] leading-none text-mb-ink pointer-coarse:min-h-11',
        TONE[skill.category],
        core ? 'font-bold' : 'font-medium',
      )}
    >
      <SkillIcon
        icon={skill.icon}
        name={skill.name}
        className='size-4 flex-none'
      />
      <span className='text-mb-ink'>{skill.name}</span>
    </button>
  );
}

/**
 * Every listed skill grouped by area, each an item tile with a tip ("Used at FPT, MoMo. First used 2022."). One tip is shown at a time,
 * owned here so a tap outside, Escape or a scroll of the panel can close it.
 */
export function ResumeSkillGroups({ className }: { className?: string }) {
  const copy = useCopy(resumeCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const [tip, setTip] = useState<ActiveTip | null>(null);
  // the tile the tip belongs to: the focus of a key press scrolls it into view, so a scroll moves the tip with it instead of closing it
  const owner = useRef<HTMLElement | null>(null);
  const hide = useCallback(() => {
    owner.current = null;
    setTip(null);
  }, []);
  const follow = useCallback(() => {
    const tile = owner.current;
    if (!tile) return;
    if (!inView(tile)) return hide();
    const rect = rectOf(tile);
    setTip((last) => (last ? { ...last, rect } : last));
  }, [hide]);

  useEffect(() => {
    if (!tip) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // the first Escape closes the tip only; the arena's own Escape (fold the page) waits for the next one
      e.stopPropagation();
      hide();
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-skill-chip]')) hide();
    };
    addEventListener('keydown', onKey, true);
    // the panel is the scroller, not the window: a scroll anywhere (capture) moves the tile out from under the tip
    addEventListener('scroll', follow, { passive: true, capture: true });
    addEventListener('resize', hide);
    document.addEventListener('click', onClick);
    return () => {
      removeEventListener('keydown', onKey, true);
      removeEventListener('scroll', follow, { capture: true });
      removeEventListener('resize', hide);
      document.removeEventListener('click', onClick);
    };
  }, [tip, hide, follow]);

  const listed = listedSkills(skills);
  const groups = ORDER.map((category) => ({
    category,
    items: listed.filter((s) => s.category === category),
  })).filter((group) => group.items.length);

  return (
    <MbDataState
      query={{ isPending, isError, refetch }}
      count={groups.length}
      empty='skills'
      subject='skills'
      level={3}
      className={className}
      skeleton={
        <div className={cn('grid gap-3 min-[640px]:grid-cols-2', className)}>
          {[0, 1, 2, 3].map((i) => (
            <MbSkeleton key={i} className='h-[150px]' />
          ))}
        </div>
      }
    >
      <div className={cn('grid gap-3 min-[640px]:grid-cols-2', className)}>
        {groups.map(({ category, items }, index) => (
          <MbCard
            key={category}
            data-area={category}
            // the first area runs across, and so does the last one when the ones between would leave it alone in its row
            className={cn(
              'min-w-0 p-4',
              (index === 0 ||
                (index === groups.length - 1 && index % 2 === 1)) &&
                'min-[640px]:col-span-2',
            )}
          >
            <div className='flex items-center gap-2.5'>
              <span
                aria-hidden='true'
                className={cn('mb-dot size-2.5 flex-none', TONE[category])}
              />
              <h4 className='text-[19px] leading-[1.2] text-mb-title'>
                {copy.skills.groups[category]}
              </h4>
              <span className='ml-auto text-[13px] font-bold text-mb-mute'>
                {items.length}
              </span>
            </div>
            <div className='mt-3 flex flex-wrap gap-2'>
              {items.map((skill) => (
                <SkillTile
                  key={skill.id}
                  skill={skill}
                  active={tip?.id === skill.id}
                  onShow={(element) => {
                    owner.current = element;
                    setTip({
                      id: skill.id,
                      text: tipText(evidence.get(skill.id), copy.skills.tip),
                      rect: rectOf(element),
                    });
                  }}
                  onHide={hide}
                />
              ))}
            </div>
          </MbCard>
        ))}
      </div>
      {tip && <ResumeSkillTip tip={tip} />}
    </MbDataState>
  );
}

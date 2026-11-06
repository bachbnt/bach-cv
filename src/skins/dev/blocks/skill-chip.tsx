/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useId, useRef, useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Skill } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { devChipVariants } from '@/skins/dev/ui/dev-chip';

/**
 * A skill as a chip with a tip that says where it was used. Hover and keyboard focus show it (Base UI), Escape and a tap elsewhere
 * hide it. On touch the first tap shows it and a second tap hides it: the tooltip does not open by touch on its own, so the tap
 * is handled here and the open/close events that touch also causes are ignored. Base UI's popup has no role and does not describe
 * its trigger, so both are set here: a screen reader reads the tip when the chip is focused.
 */
export function DevSkillChip({
  skill,
  core,
  text,
}: {
  skill: Skill;
  core: boolean;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const touch = useRef(false);
  const id = useId();
  const tipId = `${id}-tip`;

  return (
    <Tooltip
      open={open}
      triggerId={id}
      onOpenChange={(next, details) => {
        const closes =
          details.reason === 'escape-key' || details.reason === 'outside-press';
        if (next ? touch.current : !closes && touch.current) return;
        setOpen(next);
      }}
    >
      <TooltipTrigger
        id={id}
        delay={0}
        aria-describedby={open ? tipId : undefined}
        data-slot='dev-chip'
        className={cn(
          devChipVariants({ tone: skill.category, core, interactive: true }),
          'cursor-help appearance-none leading-normal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal active:brightness-90 pointer-coarse:min-h-9 pointer-coarse:items-center',
        )}
        onTouchStart={() => {
          touch.current = true;
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== 'touch') touch.current = false;
        }}
        onFocus={() => {
          if (!touch.current) setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onClick={() => {
          if (touch.current) setOpen((value) => !value);
        }}
      >
        {skill.name}
      </TooltipTrigger>
      <TooltipContent
        id={tipId}
        role='tooltip'
        className='max-w-[min(260px,calc(100vw-16px))] px-[13px] py-[9px] text-[13px]/[1.45] font-medium'
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

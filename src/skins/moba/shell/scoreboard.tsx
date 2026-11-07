/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Hourglass, Swords, Castle, type LucideIcon } from 'lucide-react';
import { mobaCopy } from '@/content/copy/moba';
import { useCopy } from '@/lib/i18n/copy';
import type { useHudData } from '@/skins/moba/shell/use-hud-data';

function Cell({
  icon: Icon,
  label,
  value,
  team,
}: {
  icon: LucideIcon;
  label: string;
  value: number | null;
  team: 'blue' | 'red' | 'gold';
}) {
  return (
    <li
      className='mb-score-cell flex items-center gap-2 px-3 max-[719px]:gap-1 max-[719px]:px-1.5'
      data-team={team}
    >
      <Icon
        aria-hidden='true'
        className='size-4 flex-none max-[719px]:size-3.5'
      />
      <span className='font-mb-display text-[22px] leading-none font-bold tabular-nums max-[719px]:text-[17px]'>
        {value ?? '–'}
      </span>
      <span className='text-[10px] leading-none font-bold tracking-[0.14em] uppercase max-[1099px]:sr-only'>
        {label}
      </span>
    </li>
  );
}

/**
 * The scoreboard at the top: three counts of the owner's work, each with its name (the number of projects, the years in software as the
 * match clock, and the roles as the towers). The names show on a wide screen and are read out everywhere.
 */
export function Scoreboard({ data }: { data: ReturnType<typeof useHudData> }) {
  const copy = useCopy(mobaCopy).scoreboard;
  return (
    <ul aria-label={copy.label} className='mb-score flex h-10 items-stretch'>
      <Cell
        icon={Swords}
        label={copy.projects}
        value={data.projects}
        team='blue'
      />
      <Cell
        icon={Hourglass}
        label={copy.years}
        value={data.years}
        team='gold'
      />
      <Cell icon={Castle} label={copy.roles} value={data.roles} team='red' />
    </ul>
  );
}

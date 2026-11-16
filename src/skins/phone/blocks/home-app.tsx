/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import type { PageKey } from '@/lib/content/schema';
import { PAGE_META } from '@/lib/pages';
import { cn } from '@/lib/utils';
import { PAGE_ICONS } from '@/skins/phone/config';
import { usePageLabels } from '@/skins/phone/shell/use-page-labels';
import { PhAppMorph } from '@/skins/phone/ui/ph-app-morph';
import { PhChip } from '@/skins/phone/ui/ph-chip';
import { PhIconTile } from '@/skins/phone/ui/ph-icon-tile';

const tile = 'size-[58px] @min-[900px]:size-[68px]';
const labelClass =
  'block w-full truncate text-center text-[12px]/[1.25] font-semibold';

/**
 * One app of the grid: a link, or (a page that is coming soon) the same icon dimmed with the word, not a link. The name is one line,
 * cut short when it is long, and whole in `title` and in the name of the link. Only the tile of a link carries the name of the morph into
 * the window of the app, so the name is on one element at a time.
 */
export function HomeApp({ page, soon }: { page: PageKey; soon: boolean }) {
  const labels = usePageLabels();
  if (soon)
    return (
      <div className='flex w-full min-w-0 flex-col items-center gap-1.5 p-1'>
        <PhIconTile
          tile={page}
          icon={PAGE_ICONS[page]}
          className={cn(tile, 'opacity-55')}
        />
        <span
          title={labels.label(page)}
          className={cn(labelClass, 'text-ph-mute')}
        >
          {labels.label(page)}
        </span>
        <PhChip>{labels.soon}</PhChip>
      </div>
    );
  return (
    <Link
      href={PAGE_META[page].href}
      title={labels.label(page)}
      className='group flex w-full min-w-0 flex-col items-center gap-1.5 rounded-ph-inner p-1 text-ph-ink no-underline transition-[scale] duration-100 active:scale-[0.95]'
    >
      <PhAppMorph page={page}>
        <PhIconTile tile={page} icon={PAGE_ICONS[page]} className={tile} />
      </PhAppMorph>
      <span className={labelClass}>{labels.label(page)}</span>
    </Link>
  );
}

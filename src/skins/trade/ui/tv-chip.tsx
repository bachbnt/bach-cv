/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** A small label like the rating of a screener row: it names a kind of project, a status, a skill. */
const chipVariants = cva(
  'inline-flex items-center rounded font-semibold whitespace-nowrap',
  {
    variants: {
      /** `sm` is for chips in a dense row (a table cell, a tag list, a row of a list) */
      size: {
        md: 'px-2 py-0.5 text-xs',
        sm: 'px-1.5 py-px text-[11px]/4',
      },
      tone: {
        neutral: 'bg-tv-hover text-tv-mute',
        up: 'bg-tv-up-bg text-tv-up',
        down: 'bg-tv-down-bg text-tv-down',
        accent: 'bg-tv-accent/15 text-tv-accent-ink',
        gold: 'bg-tv-gold/15 text-tv-gold',
        // the colour of a skill's area (the shadcn tokens the skin maps in trade.css)
        mobile: 'bg-mobile text-mobile-foreground',
        web: 'bg-web text-web-foreground',
        ai: 'bg-ai text-ai-foreground',
        tools: 'bg-tools text-tools-foreground',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  },
);

/** The round count on a control (the number of indicators on, of technologies picked). */
export const TV_BADGE =
  'grid h-4 min-w-4 place-items-center rounded-full bg-tv-accent px-1 text-[10px] leading-none font-bold text-white tabular-nums';

export function TvChip({
  tone,
  size,
  className,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof chipVariants>) {
  return (
    <span
      data-slot='tv-chip'
      className={cn(chipVariants({ tone, size }), className)}
      {...props}
    />
  );
}

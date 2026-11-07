/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A small label: a skill, a kind of project, a current role. The skill areas have the colour pair of Standard. */
export const mbChip = cva(
  'mb-chip inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] leading-none font-bold tracking-[0.04em] whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'bg-mb-raised text-mb-ink',
        gold: 'bg-mb-gold/20 text-mb-gold-ink',
        teal: 'bg-mb-teal/15 text-mb-teal-ink',
        red: 'bg-mb-red/18 text-mb-red-ink',
        mobile: 'bg-mobile text-mobile-foreground',
        web: 'bg-web text-web-foreground',
        ai: 'bg-ai text-ai-foreground',
        tools: 'bg-tools text-tools-foreground',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export function MbChip({
  className,
  tone,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof mbChip>) {
  return (
    <span
      data-slot='mb-chip'
      className={cn(mbChip({ tone }), className)}
      {...props}
    />
  );
}

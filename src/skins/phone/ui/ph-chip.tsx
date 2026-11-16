/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import type { SkillHue } from '@/skins/phone/blocks/skill-hue';

/** A small label: a technology, a status, a kind. `ok` and `warn` carry a word as well as a colour (the label is always there). */
const phChipVariants = cva(
  'inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-[12px] leading-none font-semibold whitespace-nowrap',
  {
    variants: {
      tone: {
        plain: 'bg-ph-sheet-3 text-ph-ink',
        accent: 'bg-ph-accent/15 text-ph-accent-ink',
        ok: 'bg-ph-ok/15 text-ph-ok',
        warn: 'bg-ph-warn/15 text-ph-warn',
        // a chip that has a hue takes its fill and its text from it
        hued: '',
      },
      // the hue of the area of a skill (`blocks/skill-hue.ts`): the fill and the text only, never a border or a size
      hue: {
        blue: 'bg-ph-tag-blue text-ph-tag-blue-ink',
        green: 'bg-ph-tag-green text-ph-tag-green-ink',
        violet: 'bg-ph-tag-violet text-ph-tag-violet-ink',
        amber: 'bg-ph-tag-amber text-ph-tag-amber-ink',
      },
    },
    defaultVariants: { tone: 'plain' },
  },
);

export function PhChip({
  tone,
  hue,
  className,
  ...props
}: ComponentProps<'span'> &
  Omit<VariantProps<typeof phChipVariants>, 'hue'> & { hue?: SkillHue }) {
  return (
    <span
      data-slot='ph-chip'
      data-hue={hue}
      className={cn(
        phChipVariants({ tone: hue ? 'hued' : tone, hue }),
        className,
      )}
      {...props}
    />
  );
}

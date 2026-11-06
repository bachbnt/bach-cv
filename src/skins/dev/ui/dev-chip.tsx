/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A chip: a technology or a tag. `tone` is the colour of the skill category (mobile green, web blue, AI violet, tools amber). A chip only
 * reacts to the pointer when it can be used (`interactive`: a skill chip that opens its tooltip); a tag does not lift or change colour.
 * `core` is a skill the visitor should notice. Use it on an element that is not a `span` (a `li`, a tooltip trigger) through
 * `devChipVariants` and `data-slot='dev-chip'`; `neutral` (a tag without a category) looks like `none`.
 */
export const devChipVariants = cva(
  'inline-flex rounded-[4px] border border-line-2 bg-editor px-[9px] py-0.5 font-code text-[12.5px] leading-[normal] font-normal transition-[color,border-color,transform] duration-150 ease-[ease]',
  {
    variants: {
      tone: {
        none: 'text-mute',
        neutral: 'text-mute',
        mobile: 'text-signal',
        web: 'text-sky',
        ai: 'text-fn',
        tools: 'text-field',
      },
      core: {
        true: 'border-current font-bold hover:border-current',
        false: '',
      },
      interactive: {
        true: 'hover:border-signal hover:[transform:translateY(-2px)]',
        false: '',
      },
    },
    compoundVariants: [
      {
        tone: ['none', 'neutral'],
        interactive: true,
        class: 'hover:text-head',
      },
    ],
    defaultVariants: { tone: 'none', core: false, interactive: false },
  },
);

export function DevChip({
  tone,
  core,
  interactive,
  className,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof devChipVariants>) {
  return (
    <span
      data-slot='dev-chip'
      className={cn(devChipVariants({ tone, core, interactive }), className)}
      {...props}
    />
  );
}

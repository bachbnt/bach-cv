/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';
import type { ComponentProps } from 'react';

/** The pill used for skills and categories. The colour follows the skill category, as in the design mockup. */
const tagVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-secondary text-body',
        mobile: 'bg-mobile text-mobile-foreground',
        web: 'bg-web text-web-foreground',
        ai: 'bg-ai text-ai-foreground',
        tools: 'bg-tools text-tools-foreground',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export type TagTone = NonNullable<VariantProps<typeof tagVariants>['tone']>;

export function Tag({
  tone,
  className,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof tagVariants>) {
  return <span className={cn(tagVariants({ tone }), className)} {...props} />;
}

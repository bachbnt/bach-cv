/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const devKindVariants = cva(
  'mb-2 inline-block rounded-full border px-[9px] py-px font-code text-[11px] leading-[normal] font-semibold',
  {
    variants: {
      tone: {
        gold: 'border-[color:color-mix(in_srgb,var(--yellow)_45%,transparent)] text-gold',
        signal:
          'border-[color:color-mix(in_srgb,var(--dv-accent)_45%,transparent)] text-signal',
      },
    },
    defaultVariants: { tone: 'gold' },
  },
);

/** A small pill that names the kind of a thing (Mobile app, Thesis, Latest). `signal` is the green one (Featured). */
export function DevKind({
  tone,
  className,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof devKindVariants>) {
  return (
    <span
      data-slot='dev-kind'
      className={cn(devKindVariants({ tone }), className)}
      {...props}
    />
  );
}

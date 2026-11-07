/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The buttons of the skin: a gold one for the main action, a ghost one with a gold edge, a teal one for the neutral ones. */
export const mbButton = cva('mb-btn', {
  variants: {
    variant: {
      gold: 'mb-btn-gold',
      ghost: 'mb-btn-ghost',
      teal: 'mb-btn-teal',
    },
    size: {
      sm: 'min-h-9 px-3.5 text-[11px] pointer-coarse:min-h-11',
      md: 'min-h-11 px-5 text-xs',
      icon: 'size-10 px-0 pointer-coarse:size-11',
    },
  },
  defaultVariants: { variant: 'ghost', size: 'md' },
});

export function MbButton({
  className,
  variant,
  size,
  type = 'button',
  ...props
}: ComponentProps<'button'> & VariantProps<typeof mbButton>) {
  return (
    <button
      type={type}
      data-slot='mb-button'
      className={cn(mbButton({ variant, size }), className)}
      {...props}
    />
  );
}

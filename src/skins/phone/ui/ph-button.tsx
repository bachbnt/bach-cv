/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A button of the Phone skin. `solid` is the one call to action of a screen, `tonal` the quiet one, `ghost` has no fill. The height is 44 px (a finger), pressing it shrinks it a little, and the hover only exists where there is a pointer.
 */
export const phButtonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap no-underline transition-[scale,background-color,color] duration-100 select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: 'bg-ph-accent text-ph-on-accent hover:brightness-110',
        tonal: 'bg-ph-sheet-3 text-ph-ink hover:bg-ph-line',
        ghost: 'text-ph-accent-ink hover:bg-ph-sheet-3',
      },
      size: {
        default: 'h-11 px-5 text-[15px]',
        sm: 'h-9 px-3.5 text-[14px] pointer-coarse:h-11',
        icon: 'size-11',
      },
    },
    defaultVariants: { variant: 'tonal', size: 'default' },
  },
);

type Variants = VariantProps<typeof phButtonVariants>;

export function PhButton({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & Variants) {
  return (
    <button
      data-slot='ph-button'
      type={type}
      className={cn(phButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/** A link (`next/link`, so a path of the site is a client navigation) drawn as a button. */
export function PhButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & Variants) {
  return (
    <Link
      data-slot='ph-button'
      className={cn(phButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

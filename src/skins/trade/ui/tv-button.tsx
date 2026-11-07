/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** Buttons of the terminal: a blue one for the main action, a ghost one for the toolbar and an outlined one. Touch gets 44px. */
export const tvButton = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded text-[13px] font-medium whitespace-nowrap transition-colors select-none active:scale-[.97] disabled:pointer-events-none disabled:opacity-60 pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-tv-accent text-white hover:bg-tv-accent-hover active:bg-tv-accent-hover',
        ghost: 'text-tv-ink hover:bg-tv-hover active:bg-tv-hover',
        outline:
          'border border-tv-line text-tv-ink hover:bg-tv-hover active:bg-tv-hover',
      },
      size: {
        default: 'h-8 px-3',
        sm: 'h-7 px-2.5',
        lg: 'h-9 px-4',
        icon: 'size-8 active:scale-90',
      },
    },
    defaultVariants: { variant: 'ghost', size: 'default' },
  },
);

type Props = VariantProps<typeof tvButton>;

export function TvButton({
  variant,
  size,
  className,
  ...props
}: ComponentProps<'button'> & Props) {
  return (
    <button
      type='button'
      data-slot='tv-button'
      className={cn(tvButton({ variant, size }), className)}
      {...props}
    />
  );
}

/** A link that looks like a button (a way forward in an empty card, "Back to home"). */
export function TvLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & Props) {
  return (
    <Link
      data-slot='tv-link'
      className={cn(tvButton({ variant, size }), className)}
      {...props}
    />
  );
}

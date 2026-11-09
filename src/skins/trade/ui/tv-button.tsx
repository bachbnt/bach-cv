/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** Every variant and size grows to a 44px target on touch. */
export const tvButton = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded text-[13px] font-medium whitespace-nowrap transition-[color,background-color,border-color,scale] duration-100 select-none active:scale-[.97] disabled:pointer-events-none disabled:opacity-60 pointer-coarse:min-h-11 pointer-coarse:min-w-11 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          // a white ring: the accent-coloured one would sit on the accent-coloured fill
          'bg-tv-accent text-white hover:bg-tv-accent-hover focus-visible:outline-white active:bg-tv-accent-hover',
        ghost: 'text-tv-ink hover:bg-tv-hover active:bg-tv-hover',
        outline:
          'border border-tv-line text-tv-ink hover:bg-tv-hover active:bg-tv-hover',
        // the end of a joined control (the copy button of the Connect email row): the blue block of its neighbour, a divider, no own shape
        joined:
          'rounded-none border-l border-white/25 bg-tv-accent text-white hover:bg-tv-accent-hover focus-visible:bg-tv-accent-hover focus-visible:outline-white active:scale-100 active:bg-tv-accent-hover',
      },
      size: {
        default: 'h-8 px-3',
        sm: 'h-7 px-2.5',
        lg: 'h-9 px-4',
        icon: 'size-8 active:scale-90',
        // as high as the block it ends, a little wider than a mark
        join: 'h-full w-9 px-0 pointer-coarse:w-11',
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

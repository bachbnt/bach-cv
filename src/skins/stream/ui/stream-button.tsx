/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/** The pill buttons of the skin: `solid` is the light-on-dark one (Subscribe), `tonal` the grey one, `blue` the call to action. */
export const streamButtonVariants = cva(
  'inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors select-none active:opacity-80 disabled:pointer-events-none disabled:opacity-50 pointer-coarse:h-11 [&_svg]:pointer-events-none [&_svg]:size-[18px] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        solid: 'bg-sm-ink text-sm-bg hover:opacity-90',
        tonal: 'bg-sm-hover text-sm-ink hover:bg-sm-hover2',
        blue: 'bg-sm-blue text-sm-bg hover:opacity-90',
      },
    },
    defaultVariants: { variant: 'tonal' },
  },
);

export function StreamButton({
  variant,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & VariantProps<typeof streamButtonVariants>) {
  return (
    <button
      type={type}
      data-slot='stream-button'
      className={cn(streamButtonVariants({ variant }), className)}
      {...props}
    />
  );
}

export function StreamButtonLink({
  variant,
  className,
  ...props
}: ComponentProps<typeof Link> & VariantProps<typeof streamButtonVariants>) {
  return (
    <Link
      data-slot='stream-button'
      className={cn(streamButtonVariants({ variant }), className)}
      {...props}
    />
  );
}

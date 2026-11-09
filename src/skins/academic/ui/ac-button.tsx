/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A button written by hand: a pen outline in the colour of ink (`pen`, the main action), or a quiet one (`quiet`). The outline is a little uneven
 * on purpose; the height is the same in every state.
 */
export const acButtonVariants = cva(
  'inline-flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-[9px_4px_10px_5px/5px_10px_4px_9px] border-[2.2px] bg-transparent px-4 pt-[3px] pb-1 leading-[1.1] whitespace-nowrap no-underline transition-colors disabled:cursor-not-allowed disabled:opacity-50 pointer-coarse:min-h-11',
  {
    variants: {
      variant: {
        pen: 'border-ac-link font-ac-hand text-[22px] font-bold text-ac-link hover:bg-ac-link/15',
        quiet:
          'border-ac-rule font-ac-note text-[18px] text-ac-ink hover:border-ac-mute hover:bg-ac-faint',
      },
      size: { md: '', sm: 'min-h-8 px-3 text-[18px]' },
    },
    defaultVariants: { variant: 'pen', size: 'md' },
  },
);

type Variants = VariantProps<typeof acButtonVariants>;

export function AcButton({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & Variants) {
  return (
    <button
      data-slot='ac-button'
      type={type}
      className={cn(acButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/** A link that looks like a button: an internal one when `href` starts with a slash, a new tab otherwise. */
export function AcButtonLink({
  variant,
  size,
  className,
  href,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & Variants & { href: string }) {
  const internal = href.startsWith('/');
  return internal ? (
    <Link
      data-slot='ac-button'
      href={href}
      className={cn(acButtonVariants({ variant, size }), className)}
      {...props}
    />
  ) : (
    <a
      data-slot='ac-button'
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(acButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

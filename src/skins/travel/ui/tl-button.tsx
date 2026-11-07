/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * The buttons of the Travel skin: round, with a coral call to action (`solid`), a soft teal chip (`soft`) and an outlined one (`ghost`).
 * Where a form or a menu needs another base element, pass the result of `tlButton` to it. Hover is the `hover:` variant (only inside
 * `@media (hover: hover)`); touch gets `active:`.
 */
export const tlButton = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color] duration-150 select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 pointer-coarse:min-h-11',
  {
    variants: {
      variant: {
        solid:
          'bg-gradient-to-br from-tl-coral to-[color-mix(in_srgb,var(--tl-coral)_65%,#ffb44d)] text-tl-on-coral shadow-[0_8px_18px_-8px_var(--tl-coral)] hover:-translate-y-px',
        soft: 'bg-tl-chip text-tl-chip-ink hover:-translate-y-px hover:shadow-[0_6px_14px_-6px_rgba(0,0,0,0.3)]',
        ghost:
          'border border-tl-line bg-transparent text-tl-ink hover:-translate-y-px hover:bg-tl-chip',
      },
      size: {
        default: 'h-10 px-4 text-[13.5px] [&_svg]:size-[18px]',
        sm: 'h-8 px-3 text-[12.5px] [&_svg]:size-4',
        icon: 'size-10 [&_svg]:size-[18px]',
      },
    },
    defaultVariants: { variant: 'soft', size: 'default' },
  },
);

type Variants = VariantProps<typeof tlButton>;

/** A `<button>` of the skin; `type` is `button` unless the caller says otherwise. */
export function TlButton({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & Variants) {
  return (
    <button
      data-slot='tl-button'
      type={type}
      className={cn(tlButton({ variant, size }), className)}
      {...props}
    />
  );
}

/** A link of the skin (`next/link`, a client navigation inside the site). */
export function TlButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & Variants) {
  return (
    <Link
      data-slot='tl-button'
      className={cn(tlButton({ variant, size }), className)}
      {...props}
    />
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * The look of a button of the Dev skin: a command in the editor's chrome. `outline` is the plain one, `solid` the red call to action
 * (it also has a shine that sweeps over it on hover). The shadcn `Button` is not the base: its radius, press state and disabled rules are
 * the Standard ones, and a link must stay a link. Where a form needs the shadcn `Button` (focus, `ref`, submit), pass the result of
 * `devButtonVariants` and `data-slot='dev-button'` to it.
 */
export const devButtonVariants = cva(
  'inline-flex cursor-pointer items-center justify-start gap-2 rounded-[6px] border border-[color:color-mix(in_srgb,var(--fg)_32%,var(--line-2))] font-code font-medium transition-[transform,border-color,box-shadow,filter] duration-150 ease-[ease] hover:border-signal hover:shadow-[0_0_0_3px_color-mix(in_srgb,var(--dv-accent)_22%,transparent)] hover:[transform:translateY(-1px)]',
  {
    variants: {
      variant: {
        outline: 'bg-chrome-2 text-head',
        solid:
          'relative overflow-hidden border-brand bg-brand text-white hover:border-brand hover:brightness-110 hover:shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_30%,transparent)] after:pointer-events-none after:absolute after:inset-0 after:-translate-x-[130%] after:bg-[image:linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.28)_50%,transparent_70%)] after:transition-transform after:duration-700 after:ease-[ease] after:content-[""] hover:after:translate-x-[130%]',
      },
      size: {
        default: 'min-h-10 px-4 text-[13.5px]/[1.25]',
        sm: 'min-h-[33px] px-3 text-[12.5px]/[1.25]',
      },
    },
    defaultVariants: { variant: 'outline', size: 'default' },
  },
);

type DevButtonVariants = VariantProps<typeof devButtonVariants>;

/** A `<button>` styled as a command. `type` is `button` unless the caller says otherwise. */
export function DevButton({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & DevButtonVariants) {
  return (
    <button
      data-slot='dev-button'
      type={type}
      className={cn(devButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/**
 * A link (`next/link`, so a path that stays in the site is a client navigation) styled as a command. A plain link takes the ink of the
 * page, not the bright white of a button.
 */
export function DevButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & DevButtonVariants) {
  return (
    <Link
      data-slot='dev-button'
      className={cn(
        devButtonVariants({ variant, size }),
        (variant ?? 'outline') === 'outline' && 'text-ink',
        className,
      )}
      {...props}
    />
  );
}

/** A row of buttons under a heading or a paragraph. */
export function DevButtonGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dev-button-group'
      className={cn('mt-[18px] flex flex-wrap gap-3', className)}
      {...props}
    />
  );
}

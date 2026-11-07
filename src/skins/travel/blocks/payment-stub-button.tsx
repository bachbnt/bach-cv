/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A button on the stub of a ticket: the icon over a short label that may wrap, so a stub stays narrow. `primary` is the coral one (Copy
 * number), the other is the soft teal one (QR code).
 */
export function PaymentStubButton({
  primary,
  className,
  children,
  ...props
}: ComponentProps<'button'> & { primary?: boolean }) {
  return (
    <button
      type='button'
      className={cn(
        'flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl px-1.5 py-2 text-center text-[11.5px]/[1.15] font-bold transition-[transform,box-shadow] hover:-translate-y-px active:scale-95 pointer-coarse:min-h-12 [&_svg]:size-[18px]',
        primary
          ? 'bg-gradient-to-br from-tl-coral to-[color-mix(in_srgb,var(--tl-coral)_65%,#ffb44d)] text-tl-solid shadow-[0_8px_16px_-8px_var(--tl-coral)]'
          : 'bg-tl-chip text-tl-chip-ink',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

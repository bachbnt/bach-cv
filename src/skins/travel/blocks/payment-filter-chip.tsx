/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A pill that filters a list and shows with `aria-pressed` that it is on (the coral one). */
export function PaymentFilterChip({
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type='button'
      className={cn(
        'inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-tl-line bg-tl-solid px-3.5 text-[13.5px] font-bold text-tl-ink transition-[transform,background-color] hover:-translate-y-px active:scale-95 aria-pressed:border-transparent aria-pressed:bg-tl-coral aria-pressed:text-tl-solid pointer-coarse:min-h-11',
        className,
      )}
      {...props}
    />
  );
}

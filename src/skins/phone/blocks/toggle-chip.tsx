/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A pill that is on or off (`aria-pressed`): a topic of the contact form, the bank / wallet filter. 44 px high, the accent fill when on. */
export function ToggleChip({
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type={type}
      className={cn(
        'min-h-11 cursor-pointer rounded-full bg-ph-sheet-3 px-4 text-[15px] font-semibold text-ph-ink transition-[scale,background-color,color] duration-100 select-none hover:bg-ph-line active:scale-[0.97] aria-pressed:bg-ph-accent aria-pressed:text-ph-on-accent',
        className,
      )}
      {...props}
    />
  );
}

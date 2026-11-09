/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Paper pinned to the board (`pinned`, a sheet with a pin), an index card taped up (`card`, ruled, with a red margin line) or a sticky note
 * (`sticky`). Inside it the ink is the ink of paper in both themes: `text-ac-ink` there is dark.
 */
const paperVariants = cva('', {
  variants: {
    kind: {
      pinned:
        'ac-paper ac-pin rotate-[-0.5deg] rounded-[2px] px-8 pt-[30px] pb-4',
      card: 'ac-paper ac-ruled ac-tape rounded-[2px] py-7 pr-7 pl-10 even:-rotate-[0.55deg] odd:rotate-[0.45deg]',
      sticky:
        'ac-paper ac-sticky max-w-[460px] rotate-[1.2deg] rounded-[1px_1px_18px_1px] px-[22px] py-[18px] font-ac-note text-[21px]/[1.4]',
    },
  },
  defaultVariants: { kind: 'pinned' },
});

export function AcPaper({
  kind,
  wind = kind === 'sticky',
  className,
  ...props
}: ComponentProps<'div'> &
  VariantProps<typeof paperVariants> & {
    /** a breath of wind lifts it from behind when the pointer is over it (not for a sheet that has controls in it: it would move under the pointer) */
    wind?: boolean;
  }) {
  return (
    <div
      data-slot='ac-paper'
      className={cn(paperVariants({ kind }), wind && 'ac-wind', className)}
      {...props}
    />
  );
}

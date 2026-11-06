/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

const devKbdVariants = cva('font-code', {
  variants: {
    variant: {
      /** a key in a line of hints (the image viewer) */
      key: 'mx-0.5 rounded-[4px] border border-b-2 border-line-2 px-[5px] text-[11px] leading-[normal] font-normal text-ink',
      /** the shortcut inside a send button; touch screens have no keys, so it is hidden there */
      send: 'ml-1 rounded-[4px] border-0 bg-[rgba(0,0,0,0.25)] px-1.5 py-px text-[11px] leading-[normal] font-normal text-[rgba(255,255,255,0.85)] [@media(hover:none)]:hidden',
      /** the shortcut on the chat button; hidden on a very narrow phone */
      shortcut:
        'rounded-[6px] border border-b-2 border-line-2 bg-editor px-[7px] py-[3px] text-[11.5px] leading-[normal] font-semibold whitespace-nowrap text-mute max-[520px]:hidden',
    },
  },
  defaultVariants: { variant: 'key' },
});

/** A keyboard key. */
export function DevKbd({
  variant,
  className,
  ...props
}: ComponentProps<'kbd'> & VariantProps<typeof devKbdVariants>) {
  return (
    <kbd
      data-slot='dev-kbd'
      className={cn(devKbdVariants({ variant }), className)}
      {...props}
    />
  );
}

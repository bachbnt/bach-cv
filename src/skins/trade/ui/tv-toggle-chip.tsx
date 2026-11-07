/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** The shape of a round chip, for a toggle and for a link that looks like one (the jump links of Resume). */
export const TV_PILL =
  'inline-flex h-[26px] cursor-pointer items-center gap-1.5 rounded-full border border-tv-line px-2.5 text-[13px] whitespace-nowrap text-tv-mute transition-colors hover:text-tv-ink active:text-tv-ink pointer-coarse:min-h-11 pointer-coarse:px-4';

/** A round chip that is pressed or not (a filter, a topic of the contact form). Blue when pressed. */
export function TvToggleChip({
  className,
  ...props
}: ComponentProps<'button'>) {
  return (
    <button
      type='button'
      data-slot='tv-toggle-chip'
      className={cn(
        TV_PILL,
        'aria-pressed:border-tv-accent aria-pressed:bg-tv-accent aria-pressed:text-white',
        className,
      )}
      {...props}
    />
  );
}

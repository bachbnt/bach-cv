/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Check, Copy, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** The icon of a copy button: the idle icon, and a check that pops in once the copy worked. Decorative; the button keeps its name. */
export function TvCopyIcon({
  copied,
  icon: Idle = Copy,
  className,
}: {
  copied: boolean;
  icon?: LucideIcon;
  className?: string;
}) {
  return copied ? (
    <Check
      aria-hidden='true'
      className={cn('animate-tv-check-pop', className)}
    />
  ) : (
    <Idle aria-hidden='true' className={className} />
  );
}

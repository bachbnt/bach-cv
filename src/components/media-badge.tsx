/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from 'cn';

/**
 * The badge in the corner of a picture that opens something bigger: screenshots, a certificate, a QR code.
 * Always visible (so it is found without hovering, and on touch screens). Put it inside a button that has the
 * class `group/media`, over a `relative` picture.
 */
export function MediaBadge({
  icon: Icon,
  className,
  children,
}: {
  icon: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'pointer-events-none absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-night/85 px-3 py-1.5 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(27,31,39,.25)] backdrop-blur-sm transition-colors group-hover/media:bg-night group-focus-visible/media:bg-night pointer-coarse:py-2',
        className,
      )}
    >
      <Icon className='size-4' />
      {children}
    </span>
  );
}

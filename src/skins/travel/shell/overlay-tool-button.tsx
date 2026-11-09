/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/** A round icon button of the toolbar of a window: 36px, 44px for touch. `label` is its accessible name. */
export function TlToolButton({
  label,
  className,
  ...props
}: Omit<ComponentProps<'button'>, 'aria-label'> & { label: string }) {
  return (
    <button
      type='button'
      aria-label={label}
      className={cn(
        'grid size-9 flex-none cursor-pointer place-items-center rounded-full bg-tl-chip text-tl-chip-ink transition-[transform,background-color] hover:-translate-y-px active:scale-90 disabled:pointer-events-none disabled:opacity-40 pointer-coarse:size-11 [&_svg]:size-4',
        className,
      )}
      {...props}
    />
  );
}

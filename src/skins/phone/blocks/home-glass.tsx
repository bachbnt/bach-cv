/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * A card of the home screen: the surface of the app colour, seen through a little (so the wallpaper still shows), with the ink of an
 * app on it. The text of the home screen never sits on the wallpaper itself, which has a bright light in every corner.
 */
export function HomeGlass({
  as: Tag = 'div',
  className,
  ...props
}: ComponentProps<'div'> & { as?: 'div' | 'section' }) {
  return (
    <Tag
      className={cn(
        'rounded-ph-panel border border-ph-glass-line bg-ph-sheet/75 p-4 text-ph-ink shadow-ph-card backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}

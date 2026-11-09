/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { AC_FONT_VARS } from '@/skins/academic/ui/ac-fonts';

/**
 * The root of the Academic skin (the frame and the maintenance screen): the board, its colours and the fonts. `ac-root` is the scope of
 * the rules in `academic.css`; the frame of the board is drawn by a child of it. The text is 21px on a 1.58 line like the book it imitates.
 */
export function AcRoot({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-skin-root='academic'
      className={cn(
        'ac-root min-h-screen font-ac-serif text-[19px]/[1.58] text-ac-ink min-[761px]:text-[21px]/[1.58]',
        AC_FONT_VARS,
        className,
      )}
      {...props}
    >
      <div className='ac-frame' aria-hidden='true' />
      {children}
    </div>
  );
}

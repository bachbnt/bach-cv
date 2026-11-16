/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** What a glyph takes: the call signature of a Lucide icon, so a glyph can stand where one was (`strokeWidth` is not used: a glyph is drawn, not stroked). */
export type PhGlyphProps = { className?: string; strokeWidth?: number };

export type PhGlyph = ComponentType<PhGlyphProps>;

/**
 * The drawing board of an app glyph: a 48 x 48 box (`viewBox`), decoration (the app's name is next to it). One bold pictogram of solid
 * shapes with round joins, in white and at most one quieter detail; it fills a little over half of its tile (the drawing reaches about 40
 * of the 48 units, the board is 64% of the tile).
 */
export function PhGlyphFrame({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox='0 0 48 48'
      aria-hidden='true'
      focusable='false'
      fill='none'
      className={cn('relative size-[64%] shrink-0 overflow-visible', className)}
    >
      {children}
    </svg>
  );
}

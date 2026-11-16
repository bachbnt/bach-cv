/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  TILE_GLYPHS,
  TILE_GRADIENTS,
  type TileName,
} from '@/skins/phone/config';
import type { PhGlyph } from '@/skins/phone/ui/ph-glyph-frame';
import { cn } from '@/lib/utils';

/**
 * The tile of an app, an icon of the system: a squircle (a 30% corner, and `corner-shape: squircle` where the browser has it: one radius for the gradient, the rim, the shadow, the ring of a selected tile and the focus ring) with the calm gradient of its page, one soft line of light along its
 * top edge and the soft shadow (`shadow-ph-icon`), and on it the glyph drawn for the app. Nothing else: the quiet look is the point. Decoration
 * (the name is next to it), so it is hidden from readers. A press shrinks it a little (while the control it is in is pressed, `group`, or the
 * tile itself) and a pointer brightens it by a hair (at once: a filter is not animated); the press is off for reduced motion (`phone.css` stops every transition).
 */
export function PhIconTile({
  tile,
  icon: Glyph = TILE_GLYPHS[tile],
  className,
  glyphClassName,
}: {
  tile: TileName;
  /** another glyph than the one drawn for the tile (a Lucide icon fits): the tile's own is used when it is left out */
  icon?: PhGlyph;
  className?: string;
  glyphClassName?: string;
}) {
  return (
    <span
      aria-hidden='true'
      className={cn(
        'relative inline-grid size-14 shrink-0 place-items-center rounded-[30%] [corner-shape:squircle] bg-linear-to-b text-ph-on-tile shadow-ph-icon transition-[scale] duration-100 hover:brightness-[1.06] active:scale-[0.96] group-hover:brightness-[1.06] group-active:scale-[0.96]',
        TILE_GRADIENTS[tile],
        className,
      )}
    >
      <Glyph className={glyphClassName} strokeWidth={2.6} />
    </span>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  GitBranch,
  Globe,
  GraduationCap,
  PenLine,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { Service } from '@/lib/content/schema';
import { PhIconTile } from '@/skins/phone/ui/ph-icon-tile';

/** The glyph for each `art` of a service (the drawing Standard shows), spelled out for every value so a new one does not compile until it has one. */
const GLYPHS: Record<Service['art'], LucideIcon> = {
  app: Smartphone,
  web: Globe,
  oss: GitBranch,
  teaching: GraduationCap,
  writing: PenLine,
  generic: Sparkles,
};

/** The tile of a service: the tile of the Services app with the glyph of its kind. Decoration; the name is beside it. */
export function ServiceIcon({ art }: { art: Service['art'] }) {
  return (
    <PhIconTile
      tile='services'
      icon={GLYPHS[art]}
      glyphClassName='relative size-[50%]'
      className='size-16'
    />
  );
}

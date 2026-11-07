/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  BookOpen,
  FileText,
  GitFork,
  GitMerge,
  GraduationCap,
  Globe,
  Layers,
  type LucideIcon,
  MousePointerClick,
  PenLine,
  Smartphone,
  Sparkles,
  Wrench,
} from 'lucide-react';
import type { Service } from '@/lib/content/schema';
import { cn } from '@/lib/utils';

/** The big icon of each kind of service and the small one pinned to its corner, so every kind has its own emblem. */
const EMBLEMS: Record<Service['art'], { main: LucideIcon; badge: LucideIcon }> =
  {
    app: { main: Smartphone, badge: Layers },
    web: { main: Globe, badge: MousePointerClick },
    oss: { main: GitFork, badge: GitMerge },
    teaching: { main: GraduationCap, badge: BookOpen },
    writing: { main: PenLine, badge: FileText },
    generic: { main: Sparkles, badge: Wrench },
  };

/**
 * A hexagon of the kind's colour with its icon in it, like the emblem of an item in a shop. The small badge sits outside the hexagon
 * (its clip-path would cut it off). Decoration: the name beside it names the service.
 */
export function ServiceEmblem({
  art,
  className,
}: {
  art: Service['art'];
  className?: string;
}) {
  const { main: Main, badge: Badge } = EMBLEMS[art] ?? EMBLEMS.generic;
  return (
    <span
      aria-hidden='true'
      data-art={art}
      className={cn('relative block size-[92px] flex-none', className)}
    >
      <span className='mb-emblem absolute inset-0 grid place-items-center'>
        <Main
          className='mb-emblem-icon relative z-[1] size-10'
          strokeWidth={1.6}
        />
      </span>
      <span className='mb-emblem-badge absolute right-[-2px] bottom-[2px] z-[2] grid size-8 place-items-center'>
        <Badge className='size-4' strokeWidth={2} />
      </span>
    </span>
  );
}

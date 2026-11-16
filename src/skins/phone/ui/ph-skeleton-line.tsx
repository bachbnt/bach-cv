/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';

/**
 * One line of text that is not there yet. `line` is the height of the line the real text takes (`h-6` for 15px on a 1.6 leading), so the
 * skeleton and the page share the height, and the shape is a little slimmer than the line, centred in it, as a bar of text looks.
 */
export function PhSkeletonLine({
  line,
  className,
}: {
  line: string;
  className?: string;
}) {
  return (
    <div aria-hidden='true' className={cn('flex items-center', line)}>
      <PhSkeleton className={cn('h-3/5', className)} />
    </div>
  );
}

/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

/** A line of text that is not written yet: a bar in a box as high as the line it stands for (`className` sets the height and the margin, `barClassName` the width), so a block of lines is as high as the text it stands for. */
export function AcSkeletonLine({
  className,
  barClassName,
}: {
  className?: string;
  barClassName?: string;
}) {
  return (
    <div className={cn('flex items-center', className)}>
      <AcSkeleton className={cn('w-full', barClassName)} />
    </div>
  );
}

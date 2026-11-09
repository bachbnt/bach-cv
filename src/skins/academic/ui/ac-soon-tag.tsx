/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cn } from '@/lib/utils';
import { usePageLabels } from '@/skins/academic/shell/use-page-labels';

/** The small tag after the name of a page that is coming soon (the tabs and the contents). */
export function AcSoonTag({ className }: { className?: string }) {
  const { soon } = usePageLabels();
  return (
    <small
      className={cn(
        'rounded-full border border-ac-rule px-1.5 text-[13px]',
        className,
      )}
    >
      {soon}
    </small>
  );
}

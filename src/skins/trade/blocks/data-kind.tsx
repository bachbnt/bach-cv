/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { KIND_DOT } from '@/skins/trade/blocks/data-kind-style';

/** The kind of a project (Company, Freelance, ...) with a dot in the colour the heatmap uses for it. */
export function DataKind({
  kind,
  className,
}: {
  kind: Doc<'projects'>['kind'];
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap',
        className,
      )}
    >
      <span
        aria-hidden='true'
        className={cn('size-2 flex-none rounded-full', KIND_DOT[kind])}
      />
      {copy.kinds[kind]}
    </span>
  );
}

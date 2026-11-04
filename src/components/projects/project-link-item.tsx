/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { linkLabel } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';

/** One text link of a project: App Store, GitHub, Releases... Each one is at least 44px tall on a touch screen. */
export function ProjectLinkItem({
  link,
  className,
}: {
  link: Doc<'projects'>['links'][number];
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  return (
    <a
      href={link.url}
      className={cn(
        'inline-flex items-center text-[15px] font-semibold underline underline-offset-4 hover:text-brand active:text-brand max-[720px]:min-h-11 pointer-coarse:min-h-11',
        className,
      )}
    >
      {linkLabel(link, copy.links)}
    </a>
  );
}

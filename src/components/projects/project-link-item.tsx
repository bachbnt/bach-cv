/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink } from 'lucide-react';
import { linkLabel } from '@/components/projects/project-helpers';
import { buttonVariants } from '@/components/ui/button';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';

/** One text link of a project: App Store, GitHub, Releases... A link that leaves the site opens in a new tab and says so. */
export function ProjectLinkItem({
  link,
  className,
}: {
  link: Doc<'projects'>['links'][number];
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  const external = /^https?:\/\//.test(link.url);
  return (
    <a
      href={link.url}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={cn(
        buttonVariants({ variant: 'link', size: 'link' }),
        'text-[15px]',
        className,
      )}
    >
      {linkLabel(link, copy.links)}
      {external && <ExternalLink className='size-3.5' aria-hidden='true' />}
    </a>
  );
}

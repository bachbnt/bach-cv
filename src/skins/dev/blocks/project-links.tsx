/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { linkLabel } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { DevLink } from '@/skins/dev/ui/dev-link';

/** The links of a project (App Store, GitHub, ...). One that leaves the site opens in a new tab. */
export function ProjectLinks({
  links,
  className,
}: {
  links: Doc<'projects'>['links'];
  className?: string;
}) {
  const copy = useCopy(projectsCopy);
  if (links.length === 0) return null;
  return (
    <div
      className={cn(
        'mt-3 flex flex-wrap items-center gap-x-4 gap-y-2',
        className,
      )}
    >
      {links.map((link) => {
        const external = /^https?:\/\//.test(link.url);
        return (
          <DevLink
            key={link.url}
            href={link.url}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
          >
            {linkLabel(link, copy.links)}
            {external && <span aria-hidden='true'> ↗</span>}
          </DevLink>
        );
      })}
    </div>
  );
}

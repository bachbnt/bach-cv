/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink } from 'lucide-react';
import { linkLabel } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';

/** The links of a project (App Store, GitHub, ...). One that leaves the site opens in a new tab. */
export function ProjectLinks({ links }: { links: Doc<'projects'>['links'] }) {
  const copy = useCopy(projectsCopy);
  if (links.length === 0) return null;
  return (
    <div className='flex flex-wrap gap-x-3.5 gap-y-1'>
      {links.map((link) => {
        const external = /^https?:\/\//.test(link.url);
        return (
          <a
            key={link.url}
            href={link.url}
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            data-slot='tv-link'
            className='inline-flex items-center gap-1 font-medium whitespace-nowrap text-tv-accent-ink underline-offset-[3px] hover:underline pointer-coarse:min-h-11'
          >
            {linkLabel(link, copy.links)}
            {external && <ExternalLink aria-hidden='true' className='size-3' />}
          </a>
        );
      })}
    </div>
  );
}

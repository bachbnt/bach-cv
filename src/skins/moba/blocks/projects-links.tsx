/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ExternalLink } from 'lucide-react';
import { linkLabel } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { mbButton } from '@/skins/moba/ui/mb-button';

/** The links of a project (App Store, GitHub, Releases...), named as on Standard; one that leaves the site opens in a new tab. */
export function ProjectLinks({ links }: { links: Doc<'projects'>['links'] }) {
  const copy = useCopy(projectsCopy);
  if (!links.length) return null;
  return (
    <div className='flex flex-wrap gap-2'>
      {links.map((link) => {
        const external = /^https?:\/\//.test(link.url);
        return (
          <a
            key={link.url}
            href={link.url}
            data-slot='mb-button'
            target={external ? '_blank' : undefined}
            rel={external ? 'noopener noreferrer' : undefined}
            className={mbButton({ variant: 'ghost', size: 'sm' })}
          >
            {linkLabel(link, copy.links)}
            {external && (
              <ExternalLink aria-hidden='true' className='size-3.5' />
            )}
          </a>
        );
      })}
    </div>
  );
}
